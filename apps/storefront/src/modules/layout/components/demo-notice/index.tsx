import { DEMO_COPY } from "@lib/content/demo-copy"

const DemoNotice = () => {
  return (
    <div
      className="w-full border-b border-ui-border-base bg-ui-bg-subtle"
      data-testid="demo-notice"
    >
      <p className="content-container py-2 text-center txt-compact-small text-ui-fg-subtle">
        {DEMO_COPY.banner}
      </p>
    </div>
  )
}

export default DemoNotice
