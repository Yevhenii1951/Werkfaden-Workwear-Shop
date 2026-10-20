import { HOME_IMAGES } from "@lib/util/home-images"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

const TRUST_POINTS = ["Größen XS–4XL", "Verstärkte Nähte", "Team-Bestellung"]

const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-wf-ink">
      <div className="relative h-[70vh] max-h-[720px] min-h-[480px] w-full md:h-[78vh]">
        <Image
          src={HOME_IMAGES.hero}
          alt="Zwei Mitarbeitende in Arbeitskleidung auf einer Baustelle"
          fill
          priority
          sizes="100vw"
          className="wf-hero-media object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 bottom-0 pb-12 md:pb-20">
          <div className="content-container">
            <div className="max-w-2xl">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-wf-accent">
                Arbeitskleidung für Handwerk &amp; Team
              </span>

              <h1 className="wf-display mt-4 text-[clamp(2.4rem,7vw,4.5rem)] leading-[0.9] text-wf-bone">
                Arbeitskleidung, die hält, was der Tag verlangt.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-6 text-wf-bone-dark md:text-lg md:leading-7">
                T-Shirts, Poloshirts, Sweatshirts und Jacken für Werkstatt,
                Baustelle und Garten. Robust, pflegeleicht und auf Wunsch mit
                Ihrem Logo veredelt.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <LocalizedClientLink
                  href="/store"
                  className="wf-btn bg-wf-bone text-wf-ink hover:bg-wf-bone-dark"
                >
                  Kollektion entdecken
                </LocalizedClientLink>
                <LocalizedClientLink
                  href="/personalization"
                  className="wf-btn border border-wf-bone/40 text-wf-bone transition-colors hover:bg-wf-bone hover:text-wf-ink"
                >
                  Veredelung anfragen
                </LocalizedClientLink>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {TRUST_POINTS.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-wf-bone-dark/70"
                  >
                    <span className="h-1 w-1 rounded-circle bg-wf-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
