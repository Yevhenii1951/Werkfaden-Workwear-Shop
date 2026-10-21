"use client"

import { ChevronDownMini } from "@medusajs/icons"
import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MegaMenu from "@modules/layout/components/mega-menu"
import NavHint from "@modules/layout/components/nav-hint"
import ServicesMenu from "@modules/layout/components/services-menu"

const LINK_CLASS =
  "text-[13px] font-semibold uppercase tracking-[0.12em] text-wf-ink-soft transition-colors hover:text-wf-ink"

const TOGGLE_CLASS = `${LINK_CLASS} inline-flex items-center gap-1.5`

type MenuId = "collections" | "services"

const NavLinks = () => {
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collectionsTabRef = useRef<HTMLButtonElement>(null)
  const servicesTabRef = useRef<HTMLButtonElement>(null)
  const skipFocusOpen = useRef(false)

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  const open = (menu: MenuId) => {
    clearCloseTimer()
    setOpenMenu(menu)
  }

  const close = () => {
    clearCloseTimer()
    setOpenMenu(null)
  }

  // A short delay lets the pointer travel from the tab into the open panel
  // before the menu disappears.
  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null
      setOpenMenu(null)
    }, 200)
  }

  const openOnFocus = (menu: MenuId) => {
    // Escape moves the focus back to the tab; that focus must not reopen
    // the panel the user just closed.
    if (skipFocusOpen.current) {
      skipFocusOpen.current = false
      return
    }
    open(menu)
  }

  const closeOnEscape = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || !openMenu) {
      return
    }
    const button =
      openMenu === "collections"
        ? collectionsTabRef.current
        : servicesTabRef.current
    if (button && document.activeElement !== button) {
      skipFocusOpen.current = true
      button.focus()
    }
    close()
  }

  // A pending close must not fire after the component is gone.
  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current)
      }
    }
  }, [])

  return (
    <div
      // Full header width so the Kollektion panel can span it; the pointer
      // events stay on the navigation row itself.
      className="pointer-events-none hidden lg:absolute lg:inset-x-0 lg:top-0 lg:flex lg:h-full lg:items-center lg:justify-center"
      onBlur={(event) => {
        const next = event.relatedTarget
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          close()
        }
      }}
      onKeyDown={closeOnEscape}
    >
      <nav
        aria-label="Hauptnavigation"
        className="pointer-events-auto flex h-full items-center gap-10"
      >
        <div
          className="flex items-center self-stretch"
          onMouseEnter={() => open("collections")}
          onMouseLeave={scheduleClose}
        >
          <button
            ref={collectionsTabRef}
            type="button"
            className={TOGGLE_CLASS}
            aria-expanded={openMenu === "collections"}
            aria-controls="mega-menu-kollektion"
            onClick={() => open("collections")}
            onFocus={() => openOnFocus("collections")}
            data-testid="nav-mega-toggle"
          >
            Kollektion
            <ChevronDownMini
              className={`h-3 w-3 transition-transform duration-200 ${
                openMenu === "collections" ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Inside the tab, so the panel links are reachable with the keyboard. */}
          <MegaMenu
            open={openMenu === "collections"}
            onOpen={() => open("collections")}
            onClose={scheduleClose}
          />
        </div>

        {/* The link closes an open panel, otherwise its hint would fall onto
            the tiles of the Kollektion band. */}
        <div
          className="group relative flex items-center self-stretch"
          onMouseEnter={() => close()}
          onFocus={() => close()}
        >
          <LocalizedClientLink
            href="/store"
            className={LINK_CLASS}
            aria-describedby="nav-hint-store"
            data-testid="nav-store-link"
          >
            Alle Artikel
          </LocalizedClientLink>
          <NavHint id="nav-hint-store">
            Der komplette Demo-Katalog – filterbar nach Größe, Farbe, Preis
            und Verfügbarkeit.
          </NavHint>
        </div>

        <div
          className="relative flex items-center self-stretch"
          onMouseEnter={() => open("services")}
          onMouseLeave={scheduleClose}
        >
          <button
            ref={servicesTabRef}
            type="button"
            className={TOGGLE_CLASS}
            aria-expanded={openMenu === "services"}
            aria-controls="services-menu"
            onClick={() => open("services")}
            onFocus={() => openOnFocus("services")}
            data-testid="nav-services-toggle"
          >
            Leistungen
            <ChevronDownMini
              className={`h-3 w-3 transition-transform duration-200 ${
                openMenu === "services" ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
          <ServicesMenu
            open={openMenu === "services"}
            onOpen={() => open("services")}
            onClose={scheduleClose}
          />
        </div>
      </nav>
    </div>
  )
}

export default NavLinks
