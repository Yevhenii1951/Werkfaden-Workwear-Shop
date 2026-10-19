import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import PersonalizationForm, {
  type PersonalizationProduct,
} from "@modules/personalization/components/personalization-form"

export const metadata: Metadata = {
  title: "Logo-Veredelung anfragen",
  description:
    "Senden Sie uns Ihr Logo und erhalten Sie ein persönliches Angebot für bedruckte oder bestickte Arbeitskleidung.",
}

export default async function PersonalizationPage(props: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ menge?: string; hinweis?: string }>
}) {
  const { countryCode } = await props.params
  const { menge, hinweis } = await props.searchParams
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const {
    response: { products },
  } = await listProducts({ countryCode, queryParams: { limit: 100 } })

  const options: PersonalizationProduct[] = products
    .filter((product) => (product.variants?.length ?? 0) > 0)
    .map((product) => ({
      id: product.id,
      title: product.title,
      variants: (product.variants ?? []).map((variant) => ({
        id: variant.id,
        title: variant.title ?? variant.id,
      })),
    }))

  const parsedQuantity = Number(menge)
  const initialQuantity =
    Number.isInteger(parsedQuantity) && parsedQuantity > 0
      ? parsedQuantity
      : undefined

  return (
    <div data-testid="personalization-page">
      <div className="content-container py-12">
        <h1 className="text-2xl-semi mb-3">Logo-Veredelung anfragen</h1>
        <p className="text-ui-fg-subtle max-w-xl mb-8">
          Wählen Sie ein Produkt, laden Sie Ihr Logo hoch und nennen Sie uns die
          gewünschte Menge. Wir prüfen Ihre Anfrage und melden uns mit einem
          individuellen Angebot. Die Anfrage ist unverbindlich und löst keine
          Bestellung aus.
        </p>
        <PersonalizationForm
          products={options}
          initialQuantity={initialQuantity}
          initialComment={hinweis?.slice(0, 1000)}
        />
      </div>
    </div>
  )
}
