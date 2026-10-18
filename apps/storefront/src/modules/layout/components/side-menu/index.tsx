"use client"

import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

const MENU_GROUPS: {
  title: string
  links: { label: string; href: string; testid?: string }[]
}[] = [
  {
    title: "Kollektion",
    links: [
      { label: "Alle Artikel", href: "/store", testid: "menu-store-link" },
      { label: "T-Shirts", href: "/collections/t-shirts" },
      { label: "Poloshirts", href: "/collections/poloshirts" },
      { label: "Sweatshirts & Hoodies", href: "/collections/sweatshirts-hoodies" },
      { label: "Jacken & Westen", href: "/collections/jacken-westen" },
      { label: "Arbeitshosen", href: "/collections/arbeitshosen" },
    ],
  },
  {
    title: "Service",
    links: [
      {
        label: "Logo-Veredelung",
        href: "/personalization",
        testid: "menu-personalization-link",
      },
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB", href: "/agb" },
    ],
  },
  {
    title: "Konto",
    links: [
      { label: "Anmelden", href: "/account", testid: "menu-account-link" },
      { label: "Warenkorb", href: "/cart", testid: "menu-cart-link" },
    ],
  },
]

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <Popover className="flex h-full items-center">
      {({ open, close }) => (
        <>
          <PopoverButton
            data-testid="nav-menu-button"
            className="flex h-full items-center text-sm font-medium text-wf-ink-soft transition-colors hover:text-wf-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-wf-accent focus-visible:ring-offset-2"
          >
            Menü
          </PopoverButton>

          {open && (
            <div
              className="fixed inset-0 z-[50] bg-wf-ink/30"
              onClick={close}
              data-testid="side-menu-backdrop"
              aria-hidden="true"
            />
          )}

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <PopoverPanel className="fixed inset-y-0 left-0 z-[51] flex w-[86vw] max-w-sm flex-col bg-wf-surface text-wf-ink shadow-wf">
              <div
                data-testid="nav-menu-popup"
                className="flex h-full flex-col overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-wf-line px-6 py-4">
                  <span className="wf-display text-lg">Menü</span>
                  <button
                    type="button"
                    data-testid="close-menu-button"
                    onClick={close}
                    aria-label="Menü schließen"
                    className="rounded-circle p-1.5 hover:bg-wf-bone-dark"
                  >
                    <XMark className="text-wf-ink" />
                  </button>
                </div>

                <div className="flex-1 px-6 py-6">
                  {MENU_GROUPS.map((group) => (
                    <nav
                      key={group.title}
                      aria-label={group.title}
                      className="mb-8 last:mb-0"
                    >
                      <p className="wf-eyebrow mb-3">{group.title}</p>
                      <ul className="flex flex-col gap-0.5">
                        {group.links.map((link) => (
                          <li key={link.label}>
                            <LocalizedClientLink
                              href={link.href}
                              className="block py-2 text-[17px] font-medium text-wf-ink hover:text-wf-accent-strong"
                              onClick={close}
                              data-testid={link.testid}
                            >
                              {link.label}
                            </LocalizedClientLink>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  ))}
                </div>

                <div className="flex flex-col gap-4 border-t border-wf-line px-6 py-5">
                  {!!locales?.length && (
                    <div
                      className="flex items-center justify-between"
                      onMouseEnter={languageToggleState.open}
                      onMouseLeave={languageToggleState.close}
                    >
                      <LanguageSelect
                        toggleState={languageToggleState}
                        locales={locales}
                        currentLocale={currentLocale}
                      />
                      <ArrowRightMini
                        className={clx(
                          "transition-transform duration-150",
                          languageToggleState.state ? "-rotate-90" : ""
                        )}
                      />
                    </div>
                  )}
                  <div
                    className="flex items-center justify-between"
                    onMouseEnter={countryToggleState.open}
                    onMouseLeave={countryToggleState.close}
                  >
                    {regions && (
                      <CountrySelect
                        toggleState={countryToggleState}
                        regions={regions}
                      />
                    )}
                    <ArrowRightMini
                      className={clx(
                        "transition-transform duration-150",
                        countryToggleState.state ? "-rotate-90" : ""
                      )}
                    />
                  </div>
                  <Text className="text-wf-muted text-center">
                    © {new Date().getFullYear()} Werkfaden (Demo). Alle Rechte
                    vorbehalten.
                  </Text>
                  <Text className="text-wf-muted text-center">
                    Webentwicklung: Yevhenii Riabokon
                  </Text>
                </div>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default SideMenu
