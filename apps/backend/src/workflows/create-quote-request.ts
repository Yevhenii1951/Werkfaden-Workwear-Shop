import { MedusaError, Modules } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { QUOTE_MODULE } from "../modules/quote"
import QuoteModuleService from "../modules/quote/service"
import { QuoteRequestInput } from "../modules/quote/lib/validation"
import { QuoteRequestStatus } from "../modules/quote/models/quote-request"

type QuoteItemInput = QuoteRequestInput["items"][number]

export type VerifiedQuoteItem = {
  product_id: string
  variant_id: string
  title: string
  quantity: number
}

export type CreateQuoteRequestInput = QuoteRequestInput & {
  customer_id: string | null
  access_token_hash: string
  currency_code: string
}

const verifyQuoteItemsStep = createStep(
  "verify-quote-items",
  async (items: QuoteItemInput[], { container }) => {
    const productService = container.resolve(Modules.PRODUCT)
    const resolved: VerifiedQuoteItem[] = []

    for (const item of items) {
      let variant
      try {
        variant = await productService.retrieveProductVariant(item.variant_id, {
          select: ["id", "product_id", "title"],
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

      if (variant.product_id !== item.product_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Variant does not belong to the product."
        )
      }

      const product = await productService.retrieveProduct(variant.product_id, {
        select: ["id", "title"],
      })

      resolved.push({
        product_id: product.id,
        variant_id: variant.id,
        title: `${product.title} – ${variant.title ?? variant.id}`,
        quantity: item.quantity,
      })
    }

    return new StepResponse(resolved)
  }
)

type CreateQuoteRequestRecordInput = Omit<CreateQuoteRequestInput, "items"> & {
  items: VerifiedQuoteItem[]
}

const createQuoteRequestRecordStep = createStep(
  "create-quote-request-record",
  async (input: CreateQuoteRequestRecordInput, { container }) => {
    const service = container.resolve<QuoteModuleService>(QUOTE_MODULE)

    const request = await service.createQuoteRequests({
      customer_id: input.customer_id,
      access_token_hash: input.access_token_hash,
      contact_name: input.contact_name,
      contact_email: input.contact_email,
      company: input.company ?? null,
      comment: input.comment ?? null,
      status: QuoteRequestStatus.SUBMITTED,
      currency_code: input.currency_code,
    })

    const items = await service.createQuoteRequestItems(
      input.items.map((item) => ({
        quote_request_id: request.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        title: item.title,
        quantity: item.quantity,
      }))
    )

    return new StepResponse(
      { ...request, items },
      { requestId: request.id, itemIds: items.map((created) => created.id) }
    )
  },
  async (
    compensation: { requestId: string; itemIds: string[] } | undefined,
    { container }
  ) => {
    if (!compensation) {
      return
    }

    const service = container.resolve<QuoteModuleService>(QUOTE_MODULE)

    if (compensation.itemIds.length) {
      await service.deleteQuoteRequestItems(compensation.itemIds)
    }
    await service.deleteQuoteRequests(compensation.requestId)
  }
)

export const createQuoteRequestWorkflow = createWorkflow(
  "create-quote-request",
  (input: CreateQuoteRequestInput) => {
    const items = verifyQuoteItemsStep(input.items)

    const request = createQuoteRequestRecordStep({
      contact_name: input.contact_name,
      contact_email: input.contact_email,
      company: input.company,
      comment: input.comment,
      customer_id: input.customer_id,
      access_token_hash: input.access_token_hash,
      currency_code: input.currency_code,
      items,
    })

    emitEventStep({
      eventName: "quote-request.created",
      data: { id: request.id },
    })

    return new WorkflowResponse(request)
  }
)
