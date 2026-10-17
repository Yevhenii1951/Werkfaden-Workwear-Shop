import { HOME_IMAGES } from "@lib/util/home-images"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Reveal from "@modules/common/components/reveal"
import Image from "next/image"

const TRUST_POINTS = ["Größen XS–4XL", "Verstärkte Nähte", "Team-Bestellung"]

const Hero = () => {
  return (
    <section className="wf-container pt-10 pb-16 md:pt-16 md:pb-24">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <Reveal>
            <span className="wf-eyebrow inline-flex items-center gap-2 rounded-circle border border-wf-line bg-wf-surface px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-circle bg-wf-accent" />
              Arbeitskleidung für Handwerk &amp; Team
            </span>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="wf-display mt-6 text-[clamp(2.25rem,5.5vw,4rem)] leading-[1.02]">
              Arbeitskleidung, die hält, was der Tag verlangt.
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-6 max-w-xl text-lg leading-7 text-wf-ink-soft">
              T-Shirts, Poloshirts, Sweatshirts und Jacken für Werkstatt,
              Baustelle und Garten. Robust, pflegeleicht und auf Wunsch mit
              Ihrem Logo veredelt.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LocalizedClientLink href="/store" className="wf-btn-primary">
                Kollektion entdecken
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/personalization"
                className="wf-btn-secondary"
              >
                Veredelung anfragen
              </LocalizedClientLink>
            </div>
          </Reveal>

          <Reveal delay={280}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-wf-muted"
                >
                  <span className="h-1 w-1 rounded-circle bg-wf-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal className="lg:justify-self-end">
          <div className="wf-hero-media relative aspect-[4/5] w-full overflow-hidden rounded-card border border-wf-line shadow-wf sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={HOME_IMAGES.hero}
              alt="Handwerkerin in robuster Arbeitskleidung"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Hero