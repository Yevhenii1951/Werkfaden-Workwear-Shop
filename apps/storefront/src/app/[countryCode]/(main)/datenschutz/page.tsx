import { Metadata } from "next"

import LegalPage from "@modules/legal/components/legal-page"

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Werkfaden (Demo)",
  description:
    "Datenschutz-Entwurf des Demo-Shops Werkfaden. Kein rechtsverbindlicher Text.",
}

export default function DatenschutzPage() {
  return (
    <LegalPage
      title="Datenschutzerklärung"
      intro="Informationen zur Verarbeitung personenbezogener Daten nach Art. 13 DSGVO."
    >
      <section className="flex flex-col gap-y-1">
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung ist: [Firmenname, Anschrift,
          E-Mail ergänzen]. In diesem Demo-Projekt ist kein Betreiber benannt.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>2. Art der Datenverarbeitung</h2>
        <p>
          Dieser Shop befindet sich im Demo-Betrieb. Es werden keine echten
          Bestellungen ausgelöst und es werden (außerhalb der Demo-Zwecke)
          keine produktiven Zahlungen verarbeitet.
        </p>
        <ul>
          <li>
            Server- und Zugriffsdaten: Beim Aufruf werden technisch notwendige
            Daten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite) in
            Server-Logfiles verarbeitet. Rechtsgrundlage: Art. 6 Abs. 1 lit. f
            DSGVO (berechtigtes Interesse an sicherem Betrieb).
          </li>
          <li>
            Kontakt- und Personalisierungsanfragen: Wenn Sie das Formular für
            personalisierte Artikel nutzen, verarbeiten wir die von Ihnen
            angegebenen Kontaktdaten und die hochgeladenen Dateien zur
            Bearbeitung der Anfrage. Rechtsgrundlage: Art. 6 Abs. 1 lit. b
            DSGVO.
          </li>
          <li>
            Cookies und lokale Speicherung: Der Shop setzt technisch notwendige
            Cookies für Warenkorb und Session. Eine Analyse oder Werbe-Tracking
            findet nicht statt.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>3. Speicherdauer</h2>
        <p>
          Daten werden nur so lange gespeichert, wie es für den jeweiligen
          Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen es
          verlangen. In dieser Demo werden Daten nicht dauerhaft gespeichert.
        </p>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>4. Ihre Rechte</h2>
        <ul>
          <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
          <li>
            Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art.
            77 DSGVO)
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-y-1">
        <h2>5. Keine automatisierte Entscheidungsfindung</h2>
        <p>
          Eine automatisierte Entscheidungsfindung einschließlich Profiling
          findet nicht statt.
        </p>
      </section>
    </LegalPage>
  )
}
