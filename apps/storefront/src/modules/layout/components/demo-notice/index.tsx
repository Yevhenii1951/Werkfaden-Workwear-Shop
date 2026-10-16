import { DEMO_COPY } from "@lib/content/demo-copy"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const DemoNotice = () => {
  return (
    <div
      className="w-full border-b border-ui-border-base bg-ui-bg-subtle"
      data-testid="demo-notice"
    >
      <div className="content-container py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 txt-compact-small text-ui-fg-subtle">
        <span>{DEMO_COPY.banner}</span>
        <span className="flex gap-x-3" data-testid="demo-notice-links">
          <LocalizedClientLink
            className="underline hover:text-ui-fg-base"
            href="/impressum"
          >
            Impressum
          </LocalizedClientLink>
          <LocalizedClientLink
            className="underline hover:text-ui-fg-base"
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
