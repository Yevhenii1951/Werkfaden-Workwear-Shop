import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PERSONALIZATION_MODULE } from "../modules/personalization"
import PersonalizationModuleService from "../modules/personalization/service"
import { PersonalizationRequestStatus } from "../modules/personalization/models/personalization-request"
import {
  canTransition,
  isPersonalizationStatus,
} from "../modules/personalization/lib/validation"

export type UpdatePersonalizationRequestStatusInput = {
  id: string
  status: PersonalizationRequestStatus
}

const updatePersonalizationRequestStatusStep = createStep(
  "update-personalization-request-status",
  async (input: UpdatePersonalizationRequestStatusInput, { container }) => {
    const service = container.resolve<PersonalizationModuleService>(
      PERSONALIZATION_MODULE
    )

    const request = await service.retrievePersonalizationRequest(input.id)

    if (!isPersonalizationStatus(input.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown personalization status: ${input.status}`
      )
    }

    if (request.status === input.status) {
      return new StepResponse(request, { id: input.id, status: request.status })
    }

    if (!canTransition(request.status, input.status)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot change status from ${request.status} to ${input.status}.`
      )
    }

    const updated = await service.updatePersonalizationRequests({
      id: input.id,
      status: input.status,
    })

    return new StepResponse(updated, { id: input.id, status: request.status })
  },
  async (
    previous: { id: string; status: PersonalizationRequestStatus } | undefined,
    { container }
  ) => {
    if (!previous) {
      return
    }

    const service = container.resolve<PersonalizationModuleService>(
      PERSONALIZATION_MODULE
    )

    await service.updatePersonalizationRequests({
      id: previous.id,
      status: previous.status,
    })
  }
)

export const updatePersonalizationRequestStatusWorkflow = createWorkflow(
  "update-personalization-request-status",
  (input: UpdatePersonalizationRequestStatusInput) => {
    const request = updatePersonalizationRequestStatusStep(input)

    return new WorkflowResponse(request)
  }
)
