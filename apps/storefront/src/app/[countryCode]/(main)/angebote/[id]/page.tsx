import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuoteAccept from "@modules/quotes/components/quote-accept"
import { getQuoteRequest } from "@lib/data/quotes"
import { convertToLocale } from "@lib/util/money"

export const metadata = {
  title: "Angebot",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  quoted: "Angebot liegt vor",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
  closed: "Abgeschlossen",
}

const STATUS_HINTS: Record<string, string> = {
  submitted:
    "Wir prüfen Ihre Anfrage und melden uns mit einem Angebot per E-Mail.",
  rejected:
    "Für diese Anfrage wurde kein Angebot erstellt. Sie können gerne eine neue Anfrage senden.",
  closed: "Diese Anfrage wurde abgeschlossen.",
}

export default async function QuoteDetailPage(props: {
  params: Promise<{ countryCode: string; id: string }>
}) {
  const { id } = await props.params
  const result = await getQuoteRequest(id)

  if (!result) {
    notFound()
  }

  const { request, token } = result

  return (
    <div data-testid="quote-detail-page">
      <div className="content-container py-12 max-w-2xl">
        <LocalizedClientLink
          href="/angebote"
          className="text-small-regular underline"
        >
          ← Alle Anfragen
        </LocalizedClientLink>

        <h1 className="text-2xl-semi mt-4 mb-1">Anfrage {request.id}</h1>
        <p
          className="text-ui-fg-subtle mb-8"
          data-testid="quote-status"
        >
          Status: {STATUS_LABELS[request.status] ?? request.status}
        </p>

        <ul className="flex flex-col divide-y divide-ui-border-base border border-ui-border-base rounded-rounded mb-8">
          {request.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-x-4 p-3"
            >
              <span className="text-small-regular">{item.title}</span>
              <span className="text-small-regular text-ui-fg-subtle">
                {item.quantity} Stück
              </span>
            </li>
          ))}
        </ul>

        {request.status === "quoted" && (
          <div className="flex flex-col gap-y-4">
            <p className="text-large-semi" data-testid="quote-offer-total">
              Angebot:{" "}
              {convertToLocale({
                amount: (request.offered_total_minor ?? 0) / 100,
                currency_code: request.currency_code,
              })}
            </p>
            <QuoteAccept id={request.id} token={token} />
          </div>
        )}

        {request.status === "accepted" && request.promotion_code && (
          <div className="flex flex-col gap-y-3 border border-ui-border-base rounded-rounded p-5">
            <p className="text-small-regular">Ihr Rabattcode:</p>
            <code
              className="text-lg font-semibold tracking-wider"
              data-testid="quote-promotion-code"
            >
              {request.promotion_code}
            </code>
            <p className="text-small-regular text-ui-fg-subtle">
              Der Code gilt einmalig und ist eine Woche gültig. Geben Sie ihn an
              der Kasse ein.
            </p>
            <LocalizedClientLink href="/cart" className="underline w-fit">
              Zum Warenkorb
            </LocalizedClientLink>
          </div>
        )}

        {STATUS_HINTS[request.status] && (
          <p className="text-small-regular text-ui-fg-subtle mt-6">
            {STATUS_HINTS[request.status]}
          </p>
        )}

        <p className="text-small-regular text-ui-fg-muted mt-10">
          Demo: Es wurde kein Auftrag erstellt.
        </p>
      </div>
    </div>
  )
}
