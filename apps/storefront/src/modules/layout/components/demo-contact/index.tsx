import { DEMO_COPY } from "@lib/content/demo-copy"

const DemoContact = () => {
  const { company, street, city, phone, email, notice } = DEMO_COPY.contact

  return (
    <div className="flex flex-col gap-y-2">
      <span className="wf-display text-[13px] tracking-[0.14em] text-wf-bone">
        Kontakt (Demo)
      </span>
      <div className="flex flex-col gap-y-1 text-sm text-wf-bone-dark/75">
        <span>{company}</span>
        <span>{street}</span>
        <span>{city}</span>
        <span>Tel.: {phone}</span>
        <span>E-Mail: {email}</span>
      </div>
      <span className="text-xs text-wf-bone-dark/60">{notice}</span>
    </div>
  )
}

export default DemoContact
