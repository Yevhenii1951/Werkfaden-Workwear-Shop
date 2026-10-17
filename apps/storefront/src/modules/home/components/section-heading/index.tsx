import Reveal from "@modules/common/components/reveal"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  lead?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  lead,
}: SectionHeadingProps) {
  return (
    <Reveal>
      <div className="max-w-2xl">
        <span className="wf-eyebrow">{eyebrow}</span>
        <h2 className="wf-display mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight">
          {title}
        </h2>
        {lead && <p className="mt-4 text-base leading-7 text-wf-ink-soft">{lead}</p>}
      </div>
    </Reveal>
  )
}