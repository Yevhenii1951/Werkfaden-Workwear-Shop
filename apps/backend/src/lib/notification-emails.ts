import type { NotificationTypes } from "@medusajs/framework/types"

export const DEMO_MAIL_NOTE =
  "Hinweis: Dies ist ein Demo-Shop. Es wurde keine echte Zahlung verarbeitet und keine Ware versendet."

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function formatMoney(
  amount: number | string | null | undefined,
  currency: string
): string {
  const value = Number(amount ?? 0)

  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
  }).format(Number.isFinite(value) ? value : 0)
}

export type OrderConfirmationInput = {
  displayId: number | string
  items: { title: string; quantity: number; total: string }[]
  shipping: string
  total: string
}

export function orderConfirmationEmail(
  input: OrderConfirmationInput
): NotificationTypes.NotificationContent {
  const lines = input.items.map(
    (item) => `- ${item.quantity}× ${item.title}: ${item.total}`
  )

  const text = [
    "Vielen Dank für Ihre Demo-Bestellung.",
    "",
    `Bestellnummer: ${input.displayId}`,
    "",
    ...lines,
    "",
    `Versand: ${input.shipping}`,
    `Gesamtsumme: ${input.total}`,
    "",
    DEMO_MAIL_NOTE,
  ].join("\n")

  const html = [
    "<p>Vielen Dank für Ihre Demo-Bestellung.</p>",
    `<p><strong>Bestellnummer:</strong> ${escapeHtml(String(input.displayId))}</p>`,
    "<ul>",
    ...input.items.map(
      (item) =>
        `<li>${item.quantity}× ${escapeHtml(item.title)} – ${escapeHtml(
          item.total
        )}</li>`
    ),
    "</ul>",
    `<p>Versand: ${escapeHtml(input.shipping)}<br/>Gesamtsumme: ${escapeHtml(
      input.total
    )}</p>`,
    `<p><small>${DEMO_MAIL_NOTE}</small></p>`,
  ].join("")

  return {
    subject: `Bestellbestätigung – Demo-Bestellung #${input.displayId}`,
    text,
    html,
  }
}

export type PersonalizationAcknowledgmentInput = {
  requestId: string
  contactName: string
  productTitle: string
  quantity: number
}

export function personalizationAcknowledgmentEmail(
  input: PersonalizationAcknowledgmentInput
): NotificationTypes.NotificationContent {
  const text = [
    `Guten Tag ${input.contactName},`,
    "",
    "vielen Dank für Ihre Logo-Anfrage. Wir haben sie erhalten und prüfen sie manuell.",
    "",
    `Anfragenummer: ${input.requestId}`,
    `Artikel: ${input.productTitle}`,
    `Menge: ${input.quantity}`,
    "",
    "Diese Anfrage ist keine Bestellung und reserviert keinen Lagerbestand. Wir melden uns mit einem Angebot.",
    "",
    DEMO_MAIL_NOTE,
  ].join("\n")

  const html = [
    `<p>Guten Tag ${escapeHtml(input.contactName)},</p>`,
    "<p>vielen Dank für Ihre Logo-Anfrage. Wir haben sie erhalten und prüfen sie manuell.</p>",
    `<p><strong>Anfragenummer:</strong> ${escapeHtml(
      input.requestId
    )}<br/>Artikel: ${escapeHtml(input.productTitle)}<br/>Menge: ${
      input.quantity
    }</p>`,
    "<p>Diese Anfrage ist keine Bestellung und reserviert keinen Lagerbestand. Wir melden uns mit einem Angebot.</p>",
    `<p><small>${DEMO_MAIL_NOTE}</small></p>`,
  ].join("")

  return {
    subject: "Eingangsbestätigung – Logo-Anfrage (Demo)",
    text,
    html,
  }
}
