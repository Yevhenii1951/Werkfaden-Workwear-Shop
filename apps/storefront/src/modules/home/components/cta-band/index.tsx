import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"

export default function CtaBand() {
  return (
    <section className="border-t border-wf-line bg-wf-bone-dark">
      <div className="wf-container py-16 md:py-20">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 rounded-card border border-wf-line bg-wf-surface p-8 shadow-wf md:flex-row md:items-center md:p-12">
            <div className="max-w-xl">
              <h2 className="wf-display text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">
                Bereit für Arbeitskleidung, die mitmacht?
              </h2>
              <p className="mt-3 text-base leading-7 text-wf-ink-soft">
                Stöbern Sie im Demo-Katalog und stellen Sie Ihren Warenkorb
                zusammen — ganz ohne Registrierung.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <LocalizedClientLink href="/store" className="wf-btn-primary">
                Kollektion entdecken
              </LocalizedClientLink>
              <LocalizedClientLink href="/cart" className="wf-btn-secondary">
                Zum Warenkorb
              </LocalizedClientLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}