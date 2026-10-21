import { Metadata } from "next"
import { notFound } from "next/navigation"

import { DEMO_COPY } from "@lib/content/demo-copy"
import { getRegion } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ContactMap from "@modules/contact/components/contact-map"

export const metadata: Metadata = {
  title: "Kontakt – Werkfaden (Demo)",
  description:
    "Kontakt (Demo) – Werkfaden Übungsprojekt, Kassel. Fiktive Adresse, Telefonnummer und E-Mail.",
}

export default async function KontaktPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  if (!region) {
    notFound()
  }

  const { company, street, city, country, phone, email, notice, mapNotice } =
    DEMO_COPY.contact

  return (
    <div className="content-container py-12">
      <div className="mb-10">
        <h1 className="text-2xl-semi">Kontakt</h1>
        <p className="text-small-regular text-ui-fg-subtle mt-2">
          Demo-Kontakt für dieses Übungsprojekt.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col gap-y-6">
          <div>
            <h2 className="text-large-semi mb-2">Anschrift</h2>
            <div className="text-small-regular text-ui-fg-subtle flex flex-col gap-y-1">
              <span>{company}</span>
              <span>{street}</span>
              <span>{city}</span>
              <span>{country}</span>
            </div>
          </div>

          <div>
            <h2 className="text-large-semi mb-2">Erreichbarkeit</h2>
            <div className="text-small-regular text-ui-fg-subtle flex flex-col gap-y-1">
              <span>Tel.: {phone}</span>
              <span>E-Mail: {email}</span>
            </div>
          </div>

          <div>
            <p className="text-xsmall-regular text-ui-fg-muted">{notice}</p>
          </div>

          <div>
            <h2 className="text-large-semi mb-2">Angebot anfragen</h2>
            <p className="text-small-regular text-ui-fg-subtle">
              Für Mengenangebote nutzen Sie am besten unser{" "}
              <LocalizedClientLink
                href="/angebote"
                className="underline underline-offset-4 hover:text-ui-fg-base"
              >
                Angebotsformular
              </LocalizedClientLink>
              .
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-large-semi mb-4">Standort</h2>
          <ContactMap />
          <a
            href="https://www.openstreetmap.org/?mlat=51.31536&mlon=9.49445#map=16/51.31536/9.49445"
            target="_blank"
            rel="noopener noreferrer"
            className="text-small-regular underline underline-offset-4 mt-3 inline-block hover:text-ui-fg-base"
          >
            Größere Karte auf OpenStreetMap anzeigen
          </a>
          <p className="text-xsmall-regular text-ui-fg-muted mt-2">{mapNotice}</p>
        </div>
      </div>
    </div>
  )
}
