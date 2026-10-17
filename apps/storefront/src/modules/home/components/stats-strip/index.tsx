import Reveal from "@modules/common/components/reveal"

const STATS = [
  { value: "5", label: "Kollektionen" },
  { value: "25", label: "Artikel im Demo-Katalog" },
  { value: "XS–4XL", label: "Verfügbare Größen" },
  { value: "DE", label: "Lieferung innerhalb Deutschlands" },
]

export default function StatsStrip() {
  return (
    <section className="border-y border-wf-line bg-wf-bone-dark">
      <div className="wf-container">
        <Reveal>
          <dl className="grid grid-cols-2 gap-y-8 py-10 md:grid-cols-4 md:gap-y-0">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 border-wf-line px-2 md:px-6 md:[&:not(:first-child)]:border-l"
              >
                <dt className="font-mono text-2xl font-bold text-wf-ink md:text-3xl">
                  {stat.value}
                </dt>
                <dd className="text-sm leading-5 text-wf-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}