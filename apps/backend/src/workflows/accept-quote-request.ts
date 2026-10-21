import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createPromotionsWorkflow,
  deletePromotionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { QUOTE_MODULE } from "../modules/quote"
import QuoteModuleService from "../modules/quote/service"
import { QuoteRequestStatus } from "../modules/quote/models/quote-request"
import { generatePromotionCode } from "../modules/quote/lib/tokens"
import {
  acceptQuotedRequest,
  releaseQuoteAcceptance,
} from "../modules/quote/lib/acceptance"

// Accepted quotes receive a single-use code that expires after a week.
export const QUOTE_PROMOTION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type AcceptQuoteRequestInput = {
  id: string
}

type QuoteRequestDTO = Awaited<
  ReturnType<QuoteModuleService["retrieveQuoteRequest"]>
>

type QuoteReservation = {
  id: string
  code: string
  currency_code: string
  offered_total_minor: number
  request: QuoteRequestDTO
}

/**
 * First step of the acceptance: the quote is reserved for this request with a
 * compare-and-set, so only one accept can win. The code is written to the
 * quote here, the promotion behind it is created in the next step - a request
 * that loses the race never creates a promotion.
 */
const reserveQuoteAcceptanceStep = createStep(
  "reserve-quote-acceptance",
  async (input: AcceptQuoteRequestInput, { container }) => {
    const service = container.resolve<QuoteModuleService>(QUOTE_MODULE)
    const request = await service.retrieveQuoteRequest(input.id)

    if (request.status !== QuoteRequestStatus.QUOTED) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This quote is no longer open for acceptance."
      )
    }
    if (request.offered_total_minor == null) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The quote has no offered total."
      )
    }

    const code = generatePromotionCode()
    const acceptedAt = new Date()

    const reserved = await acceptQuotedRequest(container, {
      id: request.id,
      promotionCode: code,
      acceptedAt,
    })

    if (!reserved) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This quote is no longer open for acceptance."
      )
    }

    const reservation: QuoteReservation = {
      id: request.id,
      code,
      currency_code: request.currency_code,
      offered_total_minor: request.offered_total_minor,
      request: await service.retrieveQuoteRequest(request.id),
    }

    return new StepResponse(reservation, {
      id: reservation.id,
      code: reservation.code,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    await releaseQuoteAcceptance(container, {
      id: compensation.id,
      promotionCode: compensation.code,
    })
  }
)

/**
 * Second step: the reserved code becomes a real single-use promotion.
 */
const issueQuotePromotionStep = createStep(
  "issue-quote-promotion",
  async (
    input: Pick<
      QuoteReservation,
      "code" | "currency_code" | "offered_total_minor"
    >,
    { container }
  ) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      filters: { currency_code: input.currency_code },
    })
    const region = regions[0]
    if (!region) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No region found for currency "${input.currency_code}".`
      )
    }

    const { result } = await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: [
          {
            code: input.code,
            type: "standard",
            status: "active",
            limit: 1,
            rules: [
              { attribute: "region.id", operator: "eq", values: [region.id] },
            ],
            campaign: {
              name: `Angebot ${input.code}`,
              campaign_identifier: input.code,
              ends_at: new Date(Date.now() + QUOTE_PROMOTION_TTL_MS),
            },
            application_method: {
              type: "fixed",
              target_type: "order",
              allocation: "across",
              value: input.offered_total_minor / 100,
              currency_code: input.currency_code,
            },
          },
        ],
      },
    })

    const promotion = result[0]

    return new StepResponse(
      { promotion_id: promotion.id, code: promotion.code ?? input.code },
      { promotionId: promotion.id }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    await deletePromotionsWorkflow(container).run({
      input: { ids: [compensation.promotionId] },
    })
  }
)

export const acceptQuoteRequestWorkflow = createWorkflow(
  "accept-quote-request",
  (input: AcceptQuoteRequestInput) => {
    const reservation = reserveQuoteAcceptanceStep(input)

    const promotion = issueQuotePromotionStep({
      code: reservation.code,
      currency_code: reservation.currency_code,
      offered_total_minor: reservation.offered_total_minor,
    })

    return new WorkflowResponse({
      request: reservation.request,
      code: promotion.code,
    })
  }
)
