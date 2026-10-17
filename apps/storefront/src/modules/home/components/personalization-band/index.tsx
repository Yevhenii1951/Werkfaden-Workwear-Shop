import { HOME_IMAGES } from "@lib/util/home-images"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"
import Image from "next/image"

export default function PersonalizationBand() {
  return (
    <section className="bg-wf-ink text-wf-bone">
      <div className="wf-container grid items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <span className="wf-eyebrow text-wf-bone/70">Veredelung</span>
          <h2 className="wf-display mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-wf-bone">
            Ihr Logo auf der Arbeitskleidung
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-wf-bone/75">
            Ob Brustlogo, großflächiger Druck oder Stick: Laden Sie Ihre
            Vorlage hoch und senden Sie eine unverbindliche Anfrage. Wir prüfen
            Format und Machbarkeit und melden uns mit einem Angebot.
          </p>
          <div className="mt-8">
            <LocalizedClientLink
              href="/personalization"
              className="wf-btn-primary"
            >
              Veredelung anfragen
            </LocalizedClientLink>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:justify-self-end">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card border border-white/10 lg:aspect-[4/3]">
            <Image
              src={HOME_IMAGES.personalization}
              alt="Veredelung von Arbeitskleidung mit Firmenlogo"
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}