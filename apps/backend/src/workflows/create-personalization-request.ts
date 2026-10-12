import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PERSONALIZATION_MODULE } from "../modules/personalization"
import PersonalizationModuleService from "../modules/personalization/service"
import { PersonalizationRequestInput, LogoFormat } from "../modules/personalization/lib/validation"
import { PersonalizationRequestStatus } from "../modules/personalization/models/personalization-request"

export type CreatePersonalizationRequestInput =
  PersonalizationRequestInput & {
    customer_id: string | null
    file_id: string
    logo_format: LogoFormat
  }

const verifyPersonalizationVariantStep = createStep(
  "verify-personalization-variant",
  async (input: { product_id: string; variant_id: string }, { container }) => {
    const productService = container.resolve(Modules.PRODUCT)

    let variant
    try {
      variant = await productService.retrieveProductVariant(input.variant_id, {
        select: ["id", "product_id"],
      })
    } catch {
      variant = null
    }

    if (!variant) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Unknown product variant."
      )
    }

    if (variant.product_id !== input.product_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Variant does not belong to the product."
      )
    }

    return new StepResponse({ product_id: variant.product_id })
  }
)

const createPersonalizationRequestRecordStep = createStep(
  "create-personalization-request-record",
  async (input: CreatePersonalizationRequestInput, { container }) => {
    const service = container.resolve<PersonalizationModuleService>(
      PERSONALIZATION_MODULE
    )

    const request = await service.createPersonalizationRequests({
      customer_id: input.customer_id,
      contact_name: input.contact_name,
      contact_email: input.contact_email,
      company: input.company ?? null,
      product_id: input.product_id,
      variant_id: input.variant_id,
      quantity: input.quantity,
      comment: input.comment ?? null,
      file_id: input.file_id,
      logo_format: input.logo_format,
      status: PersonalizationRequestStatus.SUBMITTED,
    })

    return new StepResponse(request, request.id)
  },
  async (requestId: string, { container }) => {
    if (!requestId) {
      return
    }

    const service = container.resolve<PersonalizationModuleService>(
      PERSONALIZATION_MODULE
    )

    await service.deletePersonalizationRequests(requestId)
  }
)

export const createPersonalizationRequestWorkflow = createWorkflow(
  "create-personalization-request",
  (input: CreatePersonalizationRequestInput) => {
    verifyPersonalizationVariantStep({
      product_id: input.product_id,
      variant_id: input.variant_id,
    })

    const request = createPersonalizationRequestRecordStep(input)

    return new WorkflowResponse(request)
  }
)
