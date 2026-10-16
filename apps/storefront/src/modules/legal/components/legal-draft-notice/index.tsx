export default function LegalDraftNotice() {
  return (
    <div
      className="border border-ui-border-base bg-ui-bg-subtle p-4"
      data-testid="legal-draft-notice"
    >
      <p className="txt-compact-medium text-ui-fg-base mb-2">
        Rechtsentwurf (Demo)
      </p>
      <p className="txt-compact-small text-ui-fg-subtle">
        Dieses Dokument ist ein Entwurf für ein Portfolio-/Demo-Projekt und
        kein rechtsverbindliches Rechtstext. Es wurde nicht anwaltlich geprüft.
        Vor einem echten Verkaufsstart müssen die Betreiberangaben ergänzt und
        alle Texte fachkundig überarbeitet werden.
      </p>
    </div>
  )
}
