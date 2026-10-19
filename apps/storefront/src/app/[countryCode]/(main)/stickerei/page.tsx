import { notFound } from "next/navigation"

import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import EmbroideryEstimator from "@modules/embroidery/components/embroidery-estimator"

export const metadata = {
  title: "Stickerei-Preisrechner",
  description:
    "Unverbindliche Schätzung des Stickpreises für Arbeitskleidung — Position, Stickgröße und Menge wählen, Preis serverseitig berechnen lassen.",
}

export default async function EmbroideryPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  return (
    <div data-testid="embroidery-page">
      <div className="content-container py-12">
        <h1 className="text-2xl-semi mb-3">Stickerei-Preisrechner</h1>
        <p className="text-ui-fg-subtle max-w-2xl mb-2">
          Wählen Sie Kleidungsstück, Position am Kleidungsstück, Größe der
          Stickerei und Menge. Wir berechnen daraus automatisch eine
          unverbindliche Schätzung des Stickpreises.
        </p>
        <p className="text-small-regular text-ui-fg-muted max-w-2xl mb-8">
          Die Schätzung ist eine Orientierung und keine Bestellung. Der
          Stickpreis ist nicht im Warenkorb enthalten; den endgültigen Preis
          bestätigen wir im individuellen Angebot.
        </p>

        <EmbroideryEstimator />

        <p className="text-small-regular text-ui-fg-subtle mt-8">
          Sie haben schon eine Veredelung im Kopf?{" "}
          <LocalizedClientLink href="/personalization" className="underline">
            Logo-Veredelung direkt anfragen
          </LocalizedClientLink>
          .
        </p>
      </div>
    </div>
  )
}
