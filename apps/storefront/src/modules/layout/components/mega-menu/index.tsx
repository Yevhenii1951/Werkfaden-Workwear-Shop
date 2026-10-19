"use client"

import { Transition } from "@headlessui/react"
import { HOME_IMAGES } from "@lib/util/home-images"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { Fragment } from "react"

type MegaMenuProps = {
  open: boolean
  close: () => void
}

const COLLECTIONS = [
  { handle: "t-shirts", title: "T-Shirts" },
  { handle: "poloshirts", title: "Poloshirts" },
  { handle: "sweatshirts-hoodies", title: "Sweatshirts & Hoodies" },
  { handle: "jacken-westen", title: "Jacken & Westen" },
  { handle: "arbeitshosen", title: "Arbeitshosen" },
]

const QUICK_LINKS = [
  { label: "Alle Artikel", href: "/store" },
  { label: "Logo-Veredelung", href: "/personalization" },
  { label: "Angebote", href: "/angebote" },
]

const FEATURED_HANDLES = ["jacken-westen", "t-shirts", "arbeitshosen"]

const MegaMenu = ({ open, close }: MegaMenuProps) => {
  const featured = COLLECTIONS.filter((c) =>
    FEATURED_HANDLES.includes(c.handle)
  )

  return (
    <Transition
      as={Fragment}
      show={open}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 -translate-y-1"
      enterTo="opacity-100 translate-y-0"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-1"
    >
      <div
        id="mega-menu-kollektion"
        className="absolute inset-x-0 top-full border-b border-wf-line bg-wf-surface"
        onMouseLeave={close}
      >
        <div className="content-container grid gap-10 py-8 lg:grid-cols-[240px_1fr] lg:gap-14 lg:py-10">
          <nav aria-label="Kollektionen">
            <p className="wf-eyebrow mb-4">Kollektionen</p>
            <ul className="flex flex-col gap-2.5">
              {COLLECTIONS.map((collection) => (
                <li key={collection.handle}>
                  <LocalizedClientLink
                    href={`/collections/${collection.handle}`}
                    className="text-[15px] font-medium text-wf-ink hover:text-wf-accent-strong"
                    onClick={close}
                  >
                    {collection.title}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>

            <p className="wf-eyebrow mb-3 mt-7">Direkt zu</p>
            <ul className="flex flex-col gap-2 text-[15px] text-wf-muted">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <LocalizedClientLink
                    href={link.href}
                    className="wf-link-sweep hover:text-wf-ink"
                    onClick={close}
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid gap-4 sm:grid-cols-3">
            {featured.map((collection) => (
              <LocalizedClientLink
                key={collection.handle}
                href={`/collections/${collection.handle}`}
                onClick={close}
                className="group relative block aspect-[4/5] overflow-hidden border border-wf-line"
              >
                <Image
                  src={HOME_IMAGES.collections[collection.handle]}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-wf-bone">
                  <span className="block font-display text-lg font-bold uppercase leading-tight tracking-[0.02em]">
                    {collection.title}
                  </span>
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] opacity-80">
                    Jetzt entdecken
                  </span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>
    </Transition>
  )
}

export default MegaMenu
