import { QuestionMarkCircle } from "@medusajs/icons"

type ServiceHintProps = {
  id: string
  name: string
  hint: string
}

/**
 * Small info icon next to a menu entry. The hint appears on hover and on
 * keyboard focus, the icon is linked to the hint via aria-describedby.
 */
const ServiceHint = ({ id, name, hint }: ServiceHintProps) => {
  return (
    <span className="group relative mt-0.5 shrink-0">
      <button
        type="button"
        aria-label={`Hinweis zu ${name}`}
        aria-describedby={id}
        className="rounded-full text-wf-muted transition-colors hover:text-wf-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wf-accent focus-visible:ring-offset-2 focus-visible:ring-offset-wf-surface"
      >
        <QuestionMarkCircle className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 w-52 -translate-y-1/2 rounded-sm border border-wf-line bg-wf-surface px-3 py-2 text-[12px] leading-[1.5] text-wf-ink-soft opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {hint}
      </span>
    </span>
  )
}

export default ServiceHint
