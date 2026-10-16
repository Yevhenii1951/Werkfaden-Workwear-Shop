import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { formatMoney, orderConfirmationEmail } from "../lib/notification-emails"

type OrderPlacedData = { id: string }

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<OrderPlacedData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationService = container.resolve(Modules.NOTIFICATION)

  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "shipping_total",
      "items.title",
      "items.quantity",
      "items.total",
    ],
    filters: { id: data.id },
  })

  if (!order?.email) {
    logger.warn(
      `order-placed: order ${data.id} has no email; skipping confirmation.`
    )
    return
  }

  const currency = (order.currency_code || "eur").toUpperCase()
  const items = (order.items ?? [])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      title: item.title ?? "Artikel",
      quantity: item.quantity ?? 0,
      total: formatMoney(item.total, currency),
    }))

  const email = orderConfirmationEmail({
    displayId: order.display_id ?? order.id,
    items,
    shipping: formatMoney(order.shipping_total, currency),
    total: formatMoney(order.total, currency),
  })

  await notificationService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-confirmation",
    content: email,
    data: { order_id: order.id, display_id: order.display_id },
    resource_id: order.id,
    resource_type: "order",
    trigger_type: "order.placed",
    idempotency_key: `order-confirmation:${order.id}`,
  })
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
