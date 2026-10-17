import Medusa from "../../../common/icons/medusa"
import NextJs from "../../../common/icons/nextjs"

const MedusaCTA = () => {
  return (
    <p className="flex gap-x-2 text-sm text-wf-muted items-center">
      Erstellt mit
      <a
        href="https://www.medusajs.com"
        target="_blank"
        rel="noreferrer"
        aria-label="Medusa"
      >
        <Medusa fill="#9ca3af" className="fill-[#9ca3af]" />
      </a>
      &
      <a
        href="https://nextjs.org"
        target="_blank"
        rel="noreferrer"
        aria-label="Next.js"
      >
        <NextJs fill="#9ca3af" />
      </a>
    </p>
  )
}

export default MedusaCTA
