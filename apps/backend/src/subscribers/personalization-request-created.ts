import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { PERSONALIZATION_MODULE } from "../modules/personalization"
import PersonalizationModuleService from "../modules/personalization/service"
import { personalizationAcknowledgmentEmail } from "../lib/notification-emails"

type PersonalizationCreatedData = { id: string }

export default async function personalizationRequestCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<PersonalizationCreatedData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notificationService = container.resolve(Modules.NOTIFICATION)
  const productService = container.resolve(Modules.PRODUCT)
  const personalizationService = container.resolve<PersonalizationModuleService>(
    PERSONALIZATION_MODULE
  )

  const request = await personalizationService.retrievePersonalizationRequest(
    data.id
  )

  if (!request?.contact_email) {
    logger.warn(
      `personalization-request-created: request ${data.id} has no contact email; skipping acknowledgment.`
    )
    return
  }

  let productTitle = "Artikel"
  try {
    const product = await productService.retrieveProduct(request.product_id, {
      select: ["title"],
    })
    productTitle = product.title
  } catch {
    logger.warn(
      `personalization-request-created: product ${request.product_id} not found; using fallback title.`
    )
  }

  const content = personalizationAcknowledgmentEmail({
    requestId: request.id,
    contactName: request.contact_name,
    productTitle,
    quantity: request.quantity,
  })

  await notificationService.createNotifications({
    to: request.contact_email,
    channel: "email",
    template: "personalization-acknowledgment",
    content,
    data: { request_id: request.id },
    resource_id: request.id,
    resource_type: "personalization_request",
    trigger_type: "personalization-request.created",
    idempotency_key: `personalization-acknowledgment:${request.id}`,
  })
}

export const config: SubscriberConfig = {
  event: "personalization-request.created",
}
