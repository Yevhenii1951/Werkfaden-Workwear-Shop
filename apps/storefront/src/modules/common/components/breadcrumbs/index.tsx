import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type BreadcrumbItem = {
  label: string
  href?: string
}

const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => {
  return (
    <nav aria-label="Brotkrumen" className="pt-6">
      <ol className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-wf-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="text-wf-line">
                /
              </span>
            )}
            {item.href ? (
              <LocalizedClientLink
                href={item.href}
                className="wf-link-sweep transition-colors hover:text-wf-ink"
              >
                {item.label}
              </LocalizedClientLink>
            ) : (
              <span className="text-wf-ink" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
