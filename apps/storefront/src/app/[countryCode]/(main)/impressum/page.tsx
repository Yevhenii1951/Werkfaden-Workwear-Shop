import { Metadata } from "next"

import LegalPage from "@modules/legal/components/legal-page"

export const metadata: Metadata = {
  title: "Impressum – Werkfaden (Demo)",
  description:
    "Impressum-Entwurf des Demo-Shops Werkfaden. Kein rechtsverbindliches Impressum.",
}

export default function ImpressumPage() {
  return (
    <LegalPage
      title="Impressum"
      intro="Angaben gemäß § 5 DDG (ehemals § 5 TMG)."
    >
      <p>
        Das folgende Impressum ist ein Platzhalter. Die Angaben zum Betreiber
        liegen für dieses Demo-Projekt nicht vor und sind noch zu ergänzen.
      </p>

      <section className="flex flex-col gap-y-1">
        <h2>Anbieter</h2>
        <ul>
          <li>Firma: [Vollständiger Firmenname ergänzen]</li>
          <li>Rechtsform: [z. B. GmbH, GbR, Einzelunternehmen]</li>
          <li>Anschrift: [Straße, Hausnummer, PLZ, Ort]</li>
          <li>Vertreten durch: [Name der vertretungsberechtigten Person]</li>
        </ul>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>Kontakt</h2>
        <ul>
          <li>Telefon: [Telefonnummer ergänzen]</li>
          <li>E-Mail: [E-Mail-Adresse ergänzen]</li>
        </ul>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>Register und Steuern</h2>
        <ul>
          <li>Registergericht: [Registergericht ergänzen]</li>
          <li>Registernummer: [Handelsregisternummer ergänzen]</li>
          <li>Umsatzsteuer-Identifikationsnummer: [USt-IdNr. gemäß § 27 a UStG]</li>
        </ul>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <ul>
          <li>[Name und Anschrift ergänzen]</li>
        </ul>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>Hinweis</h2>
        <p>
          Werkfaden ist ein Demo-Shop. Es werden keine echten Bestellungen
          angenommen und keine echten Zahlungen abgewickelt. Über die
          bereitgestellten Verlinkungen wird keine Haftung für fremde Inhalte
          übernommen.
        </p>
      </section>
    </LegalPage>
  )
}
