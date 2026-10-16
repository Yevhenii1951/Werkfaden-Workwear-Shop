import { Metadata } from "next"

import LegalPage from "@modules/legal/components/legal-page"

export const metadata: Metadata = {
  title: "Widerrufsbelehrung – Werkfaden (Demo)",
  description:
    "Widerrufsbelehrung (Entwurf) des Demo-Shops Werkfaden.",
}

export default function WiderrufPage() {
  return (
    <LegalPage
      title="Widerrufsbelehrung"
      intro="Entwurf für den Demo-Shop Werkfaden."
    >
      <section className="flex flex-col gap-y-1">
        <h2>Widerrufsrecht</h2>
        <p>
          Verbraucherinnen und Verbraucher haben das Recht, binnen vierzehn
          Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die
          Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein
          von Ihnen benannter Dritter die Ware in Besitz genommen haben.
        </p>
        <p>
          Um Ihr Widerrufsrecht auszuüben, kontaktieren Sie uns unter
          [E-Mail-Adresse ergänzen] mit einer eindeutigen Erklärung. Zur
          Fristwahrung genügt die Absendung vor Ablauf der Widerrufsfrist.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>Folgen des Widerrufs</h2>
        <p>
          Wenn Sie diesen Vertrag widerrufen, erstatten wir Ihnen alle
          Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und
          spätestens binnen vierzehn Tagen ab dem Tag, an dem uns Ihre
          Widerrufserklärung zugeht. Für die Rückzahlung verwenden wir
          dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
          eingesetzt haben.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>Ausnahmen</h2>
        <p>
          Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von
          Waren, die nach Kundenspezifikation angefertigt oder eindeutig auf
          die persönlichen Bedürfnisse zugeschnitten sind (§ 312g Abs. 2 Nr. 1
          BGB). Das betrifft insbesondere individualisierte Artikel mit Ihrem
          eigenen Logo oder Motiv.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>Widerrufsformular (Muster)</h2>
        <p>
          An [Firmenname, Anschrift, E-Mail ergänzen]: Hiermit widerrufe(n) ich
          / wir den von mir / uns abgeschlossenen Vertrag über den Kauf der
          folgenden Waren: [Ware(n) benennen]. Bestellt am [Datum] / erhalten
          am [Datum]. Name und Anschrift der Verbraucherin / des Verbrauchers.
          Datum und Unterschrift.
        </p>
      </section>
    </LegalPage>
  )
}
