import { DEMO_COPY } from "@lib/content/demo-copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const DemoNotice = () => {
  return (
    <div
      className="w-full bg-wf-ink text-wf-bone"
      role="region"
      aria-label="Demo-Hinweis"
      data-testid="demo-notice"
    >
      <div className="content-container py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-wf-bone/80">
        <span>{DEMO_COPY.banner}</span>
        <span className="flex gap-x-3" data-testid="demo-notice-links">
          <LocalizedClientLink
            className="underline underline-offset-2 hover:text-wf-accent"
            href="/impressum"
          >
            Impressum
          </LocalizedClientLink>
          <LocalizedClientLink
            className="underline underline-offset-2 hover:text-wf-accent"
            href="/datenschutz"
          >
            Datenschutz
          </LocalizedClientLink>
        </span>
      </div>
    </div>
  )
}

export default DemoNotice
