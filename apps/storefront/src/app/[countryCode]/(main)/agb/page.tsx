import { Metadata } from "next"

import LegalPage from "@modules/legal/components/legal-page"

export const metadata: Metadata = {
  title: "AGB – Werkfaden (Demo)",
  description:
    "Allgemeine Geschäftsbedingungen (Entwurf) des Demo-Shops Werkfaden.",
}

export default function AgbPage() {
  return (
    <LegalPage
      title="Allgemeine Geschäftsbedingungen (AGB)"
      intro="Entwurf für den Demo-Shop Werkfaden."
    >
      <section className="flex flex-col gap-y-1">
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen
          über den Shop Werkfaden. Werkfaden ist ein Demo-Shop; tatsächliche
          Vertragsverhältnisse entstehen nicht.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>2. Vertragsschluss</h2>
        <p>
          Die Darstellung der Produkte im Shop stellt kein verbindliches
          Angebot dar. Im Demo-Betrieb wird kein Kaufvertrag geschlossen.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>3. Preise und Versand</h2>
        <p>
          Alle Preise verstehen sich in Euro und enthalten die gesetzliche
          Umsatzsteuer. Der Standardversand innerhalb Deutschlands kostet 5,90
          EUR; ab einem Bestellwert von 100,00 EUR entfällt der Versand.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>4. Lieferung</h2>
        <p>
          Der Versand ist auf Deutschland beschränkt. Lieferzeiten sind im
          Demo-Betrieb nicht verbindlich.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>5. Zahlung</h2>
        <p>
          Im Demo-Shop werden keine echten Zahlungen verarbeitet. Eine
          Zahlungsabwicklung erfolgt ausschließlich im Testmodus.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>6. Widerrufsrecht</h2>
        <p>
          Verbraucherinnen und Verbrauchern steht grundsätzlich ein
          Widerrufsrecht zu. Einzelheiten finden Sie in der
          Widerrufsbelehrung. Für personalisierte Artikel gelten die dort
          genannten Ausnahmen.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>7. Schlussbestimmungen</h2>
        <p>
          Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam
          sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </section>
    </LegalPage>
  )
}
