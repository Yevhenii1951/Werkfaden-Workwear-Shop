import LegalDraftNotice from "@modules/legal/components/legal-draft-notice"

type LegalPageProps = {
  title: string
  intro: string
  children: React.ReactNode
}

export default function LegalPage({ title, intro, children }: LegalPageProps) {
  return (
    <div className="content-container py-16 small:py-24">
      <div className="max-w-3xl mx-auto flex flex-col gap-y-8">
        <header className="flex flex-col gap-y-2">
          <h1 className="txt-compact-xlarge-plus text-ui-fg-base">{title}</h1>
          <p className="txt-compact-medium text-ui-fg-subtle">{intro}</p>
        </header>
        <LegalDraftNotice />
        <div className="flex flex-col gap-y-6 txt-compact-medium text-ui-fg-base [&_h2]:txt-compact-large [&_h2]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-y-1">
          {children}
        </div>
      </div>
    </div>
  )
}
