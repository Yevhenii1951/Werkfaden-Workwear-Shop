import { DEMO_COPY } from "@lib/content/demo-copy"

const DemoNotice = () => {
  return (
    <div
      className="w-full bg-wf-ink text-wf-bone"
      role="region"
      aria-label="Demo-Hinweis"
      data-testid="demo-notice"
    >
      <div className="content-container py-1.5 flex flex-wrap items-center justify-center font-mono text-[8px] uppercase tracking-[0.12em] text-wf-bone/80">
        <span>{DEMO_COPY.banner}</span>
      </div>
    </div>
  )
}

export default DemoNotice
