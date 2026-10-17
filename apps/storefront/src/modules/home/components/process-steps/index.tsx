import Reveal from "@modules/common/components/reveal"

import SectionHeading from "@modules/home/components/section-heading"

const STEPS = [
  {
    index: "01",
    title: "Auswählen",
    text: "Artikel, Farbe und Größe wählen — der Warenkorb zeigt sofort Preis und Verfügbarkeit.",
  },
  {
    index: "02",
    title: "Veredelung (optional)",
    text: "Logo oder Stick als Anfrage hochladen. Wir prüfen Machbarkeit und Format.",
  },
  {
    index: "03",
    title: "Lieferung",
    text: "Bestellung abschließen — Versand innerhalb Deutschlands, ab 100 € versandkostenfrei.",
  },
]

export default function ProcessSteps() {
  return (
    <section className="border-y border-wf-line bg-wf-surface">
      <div className="wf-container py-16 md:py-24">
        <SectionHeading
          eyebrow="So einfach geht's"
          title="In drei Schritten zur Bestellung"
        />

        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal
              as="li"
              key={step.index}
              delay={index * 80}
              className="flex flex-col gap-3"
            >
              <span className="font-mono text-sm font-bold text-wf-accent-strong">
                {step.index}
              </span>
              <h3 className="wf-display text-lg">{step.title}</h3>
              <p className="text-sm leading-6 text-wf-ink-soft">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}