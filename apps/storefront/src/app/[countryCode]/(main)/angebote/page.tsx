import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import QuoteRequestForm, {
  type QuoteFormItem,
  type QuoteProductOption,
} from "@modules/quotes/components/quote-request-form"
import { getRegion } from "@lib/data/regions"
import { retrieveCart } from "@lib/data/cart"
import { listProducts } from "@lib/data/products"
import { listQuoteRequests } from "@lib/data/quotes"

export const metadata = {
  title: "Angebote anfragen",
  description:
    "Fordern Sie ein individuelles Angebot für Arbeitskleidung an — für Firmen, Teams und größere Mengen.",
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Entwurf",
  submitted: "Eingereicht",
  quoted: "Angebot liegt vor",
  accepted: "Angenommen",
  rejected: "Abgelehnt",
  closed: "Abgeschlossen",
}

export default async function QuotesPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ hinweis?: string }>
}) {
  const { countryCode } = await props.params
  const { hinweis } = await props.searchParams
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const [requests, cart, productList] = await Promise.all([
    listQuoteRequests(),
    retrieveCart(),
    listProducts({ countryCode, queryParams: { limit: 100 } }),
  ])

  const options: QuoteProductOption[] = productList.response.products
    .filter((product) => (product.variants?.length ?? 0) > 0)
    .map((product) => ({
      id: product.id,
      title: product.title,
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        title: variant.title ?? variant.id,
      })),
    }))

  const initialItems: QuoteFormItem[] = (cart?.items ?? [])
    .filter((item) => item.variant_id && item.product_id)
    .map((item) => ({
      product_id: item.product_id as string,
      variant_id: item.variant_id as string,
      title:
        [item.product_title, item.variant_title].filter(Boolean).join(" – ") ||
        item.title,
      quantity: item.quantity,
    }))

  return (
    <div data-testid="quotes-page">
      <div className="content-container py-12">
        <h1 className="text-2xl-semi mb-3">Angebote anfragen</h1>
        <p className="text-ui-fg-subtle max-w-2xl mb-8">
          Für Firmen, Teams und größere Bestellungen erstellen wir ein
          individuelles Angebot. Wählen Sie die Artikel und Mengen, nennen Sie
          uns Ihre Kontaktdaten und wir melden uns mit einem unverbindlichen
          Preis. Die Anfrage löst keine Bestellung aus.
        </p>

        {requests.length > 0 && (
          <section className="mb-10" data-testid="quote-history">
            <h2 className="txt-compact-large-plus mb-3">Ihre Anfragen</h2>
            <ul className="flex flex-col divide-y divide-ui-border-base border border-ui-border-base rounded-rounded">
              {requests.map((request) => (
                <li
                  key={request.id}
                  className="flex items-center justify-between gap-x-4 p-4"
                >
                  <span className="text-small-regular">
                    {new Date(request.created_at).toLocaleDateString("de-DE")} ·{" "}
                    {STATUS_LABELS[request.status] ?? request.status}
                  </span>
                  <LocalizedClientLink
                    href={`/angebote/${request.id}`}
                    className="text-small-regular underline"
                  >
                    Ansehen
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        <QuoteRequestForm
          countryCode={countryCode}
          products={options}
          initialItems={initialItems}
          initialComment={hinweis?.slice(0, 1000)}
        />
      </div>
    </div>
  )
}
