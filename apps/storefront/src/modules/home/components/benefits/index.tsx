import Reveal from "@modules/common/components/reveal"

import SectionHeading from "@modules/home/components/section-heading"

type Benefit = {
  title: string
  text: string
  icon: React.ReactNode
}

const iconClass = "h-6 w-6"
const iconProps = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
}

const BENEFITS: Benefit[] = [
  {
    title: "Robust & langlebig",
    text: "Verstärkte Nähte und pflegeleichte Materialien, die häufiges Waschen aushalten.",
    icon: (
      <svg className={iconClass} {...iconProps}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Passgenaue Größen",
    text: "Von XS bis 4XL. Größenhilfe und Maßangaben stehen bei jedem Artikel.",
    icon: (
      <svg className={iconClass} {...iconProps}>
        <path d="M3 8h18M3 8v8a1 1 0 001 1h16a1 1 0 001-1V8" />
        <path d="M8 8v3M12 8v4M16 8v3" />
      </svg>
    ),
  },
  {
    title: "Veredelung möglich",
    text: "Firmenlogo als Druck oder Stick — direkt als Anfrage im Shop.",
    icon: (
      <svg className={iconClass} {...iconProps}>
        <path d="M4 20l6-6" />
        <path d="M14 4l6 6-8.5 8.5a2 2 0 01-1.4.6H6v-3.1a2 2 0 01.6-1.4L14 4z" />
      </svg>
    ),
  },
  {
    title: "Schnelle Lieferung",
    text: "Versand innerhalb Deutschlands. Ab 100 € Warenwert versandkostenfrei.",
    icon: (
      <svg className={iconClass} {...iconProps}>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="17" cy="18" r="1.6" />
      </svg>
    ),
  },
]

export default function Benefits() {
  return (
    <section className="wf-container py-16 md:py-24">
      <SectionHeading
        eyebrow="Warum Werkfaden"
        title="Gemacht für den Arbeitsalltag"
      />

      <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((benefit, index) => (
          <Reveal
            as="li"
            key={benefit.title}
            delay={index * 60}
            className="wf-card flex h-full flex-col gap-3 p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-circle bg-wf-bone-dark text-wf-accent-strong">
              {benefit.icon}
            </span>
            <h3 className="wf-display text-base">{benefit.title}</h3>
            <p className="text-sm leading-6 text-wf-ink-soft">{benefit.text}</p>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}