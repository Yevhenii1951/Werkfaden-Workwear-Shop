const ANNOUNCEMENTS = [
  "Versandkostenfrei ab 100 € — Deutschland",
  "Größen XS–4XL auf Lager",
]

const AnnouncementBar = () => {
  return (
    <div className="hidden bg-wf-ink md:block" role="region" aria-label="Ankündigungen">
      <div className="content-container flex h-9 items-center justify-center text-[11px] uppercase tracking-[0.12em]">
        <ul
          className="flex items-center gap-8 font-medium text-wf-bone"
          aria-live="polite"
        >
          {ANNOUNCEMENTS.map((message) => (
            <li key={message} className="wf-pulse">
              {message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AnnouncementBar
