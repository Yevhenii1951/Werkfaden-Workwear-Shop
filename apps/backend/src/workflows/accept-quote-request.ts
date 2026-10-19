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

// Accepted quotes receive a single-use code that expires after a week.
export const QUOTE_PROMOTION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type AcceptQuoteRequestInput = {
  id: string
}

const issueQuotePromotionStep = createStep(
  "issue-quote-promotion",
  async (input: AcceptQuoteRequestInput, { container }) => {
    const service = container.resolve<QuoteModuleService>(QUOTE_MODULE)
    const request = await service.retrieveQuoteRequest(input.id)

    if (request.status !== QuoteRequestStatus.QUOTED) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only a quoted request can be accepted."
      )
    }
    if (request.offered_total_minor == null) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The quote has no offered total."
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: regions } = await query.graph({
      entity: "region",
      fields: ["id", "currency_code"],
      filters: { currency_code: request.currency_code },
    })
    const region = regions[0]
    if (!region) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No region found for currency "${request.currency_code}".`
      )
    }

    const code = generatePromotionCode()

    const { result } = await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: [
          {
            code,
            type: "standard",
            status: "active",
            limit: 1,
            rules: [
              { attribute: "region.id", operator: "eq", values: [region.id] },
            ],
            campaign: {
              name: `Angebot ${code}`,
              campaign_identifier: code,
              ends_at: new Date(Date.now() + QUOTE_PROMOTION_TTL_MS),
            },
            application_method: {
              type: "fixed",
              target_type: "order",
              allocation: "across",
              value: request.offered_total_minor / 100,
              currency_code: request.currency_code,
            },
          },
        ],
      },
    })

    const promotion = result[0]

    return new StepResponse(
      { promotion_id: promotion.id, code: promotion.code ?? "" },
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

const markQuoteAcceptedStep = createStep(
  "mark-quote-accepted",
  async (input: { id: string; code: string }, { container }) => {
    const service = container.resolve<QuoteModuleService>(QUOTE_MODULE)
    const request = await service.retrieveQuoteRequest(input.id)

    if (request.status !== QuoteRequestStatus.QUOTED) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This quote is no longer open for acceptance."
      )
    }

    const updated = await service.updateQuoteRequests({
      id: request.id,
      status: QuoteRequestStatus.ACCEPTED,
      promotion_code: input.code,
      accepted_at: new Date(),
    })

    return new StepResponse(updated, {
      id: request.id,
      status: request.status,
      promotion_code: request.promotion_code,
      accepted_at: request.accepted_at,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const service = container.resolve<QuoteModuleService>(QUOTE_MODULE)
    await service.updateQuoteRequests({
      id: compensation.id,
      status: compensation.status,
      promotion_code: compensation.promotion_code,
      accepted_at: compensation.accepted_at,
    })
  }
)

export const acceptQuoteRequestWorkflow = createWorkflow(
  "accept-quote-request",
  (input: AcceptQuoteRequestInput) => {
    const promotion = issueQuotePromotionStep(input)

    const request = markQuoteAcceptedStep({
      id: input.id,
      code: promotion.code,
    })

    return new WorkflowResponse({
      request: request,
      code: promotion.code,
    })
  }
)
