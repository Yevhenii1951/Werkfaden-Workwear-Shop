import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { QUOTE_MODULE } from "../modules/quote"
import QuoteModuleService from "../modules/quote/service"
import { QuoteRequestStatus } from "../modules/quote/models/quote-request"
import {
  canTransition,
  isOperatorStatus,
  isQuoteStatus,
  isValidOfferMinor,
  offerToMinor,
} from "../modules/quote/lib/validation"
import { transitionQuoteStatus } from "../modules/quote/lib/status"

export type UpdateQuoteStatusInput = {
  id: string
  status: string
  offered_total?: number
}

const updateQuoteStatusStep = createStep(
  "update-quote-status",
  async (input: UpdateQuoteStatusInput, { container }) => {
    const service = container.resolve<QuoteModuleService>(QUOTE_MODULE)
    const request = await service.retrieveQuoteRequest(input.id)

    if (!isQuoteStatus(input.status) || !isOperatorStatus(input.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Unsupported quote status transition for an operator."
      )
    }

    if (!canTransition(request.status, input.status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Quote cannot move from "${request.status}" to "${input.status}".`
      )
    }

    let offer: { offeredTotalMinor: number; quotedAt: Date } | undefined

    if (input.status === QuoteRequestStatus.QUOTED) {
      if (typeof input.offered_total !== "number") {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "An offer total is required to quote a request."
        )
      }
      const offeredMinor = offerToMinor(input.offered_total)
      if (!isValidOfferMinor(offeredMinor)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "The offer total is outside the allowed range."
        )
      }
      offer = { offeredTotalMinor: offeredMinor, quotedAt: new Date() }
    }

    // Compare-and-set against the status this step validated: a buyer who
    // accepted in the meantime keeps the decision, and the operator gets a
    // conflict instead of overwriting it.
    const applied = await transitionQuoteStatus(container, {
      id: request.id,
      from: request.status,
      to: input.status,
      ...offer,
    })

    if (!applied) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "This quote changed in the meantime. Reload it and try again."
      )
    }

    return new StepResponse(await service.retrieveQuoteRequest(request.id), {
      id: request.id,
      written: input.status,
      previous: request.status,
      previous_offered_total_minor: request.offered_total_minor ?? undefined,
      previous_quoted_at: request.quoted_at ?? undefined,
    })
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    await transitionQuoteStatus(container, {
      id: compensation.id,
      from: compensation.written,
      to: compensation.previous,
      offeredTotalMinor: compensation.previous_offered_total_minor,
      quotedAt: compensation.previous_quoted_at,
    })
  }
)

export const updateQuoteStatusWorkflow = createWorkflow(
  "update-quote-status",
  (input: UpdateQuoteStatusInput) => {
    const request = updateQuoteStatusStep(input)

    emitEventStep({
      eventName: "quote-request.status-changed",
      data: { id: request.id, status: request.status },
    })

    return new WorkflowResponse(request)
  }
)
