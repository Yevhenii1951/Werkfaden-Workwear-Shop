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

    const update: Record<string, unknown> = {
      id: request.id,
      status: input.status,
    }

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
      update.offered_total_minor = offeredMinor
      update.quoted_at = new Date()
    }

    const updated = await service.updateQuoteRequests(update)

    return new StepResponse(updated, {
      id: request.id,
      status: request.status,
      offered_total_minor: request.offered_total_minor,
      quoted_at: request.quoted_at,
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
      offered_total_minor: compensation.offered_total_minor,
      quoted_at: compensation.quoted_at,
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
