"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MegaMenu from "@modules/layout/components/mega-menu"

const LINK_CLASS =
  "text-[13px] font-semibold uppercase tracking-[0.12em] text-wf-ink-soft transition-colors hover:text-wf-ink"

const NavLinks = () => {
  const [megaOpen, setMegaOpen] = useState(false)

  return (
    <div
      className="hidden lg:flex lg:self-stretch lg:items-center lg:mx-auto"
      onMouseEnter={() => setMegaOpen(true)}
      onMouseLeave={() => setMegaOpen(false)}
    >
      <nav aria-label="Hauptnavigation" className="flex items-center gap-10">
        <button
          type="button"
          className={LINK_CLASS}
          aria-expanded={megaOpen}
          aria-controls="mega-menu-kollektion"
          onClick={() => setMegaOpen((prev) => !prev)}
          data-testid="nav-mega-toggle"
        >
          Kollektion
        </button>
        <LocalizedClientLink
          href="/store"
          className={LINK_CLASS}
          data-testid="nav-store-link"
        >
          Alle Artikel
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/personalization"
          className={LINK_CLASS}
          data-testid="nav-personalization-link"
        >
          Logo-Veredelung
        </LocalizedClientLink>
      </nav>

      <MegaMenu open={megaOpen} close={() => setMegaOpen(false)} />
    </div>
  )
}

export default NavLinks
