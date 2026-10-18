import { Suspense } from "react"

import { User, ShoppingCart } from "@medusajs/icons"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import CartButton from "@modules/layout/components/cart-button"
import NavLinks from "@modules/layout/components/nav-links"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <AnnouncementBar />
      <header className="relative bg-wf-bone">
        {/* Single row: burger (mobile) | logo | nav | utilities */}
        <div className="content-container flex h-14 items-center gap-6 md:h-16 md:gap-8">
          <div className="flex items-center lg:hidden">
            <SideMenu
              regions={regions}
              locales={locales}
              currentLocale={currentLocale}
            />
          </div>

          <LocalizedClientLink
            href="/"
            className="wf-display shrink-0 text-[22px] text-wf-ink md:text-[26px]"
            data-testid="nav-store-link"
          >
            Werkfaden
          </LocalizedClientLink>

          <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <NavLinks />
          </div>

          <div className="ml-auto flex items-center gap-4 text-wf-ink-soft md:gap-5">
            <Search />
            <LocalizedClientLink
              className="group inline-flex h-9 w-9 items-center justify-center rounded-circle transition-colors hover:bg-wf-bone-dark hover:text-wf-ink"
              href="/account"
              data-testid="nav-account-link"
              aria-label="Konto"
            >
              <User
                className="h-5 w-5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="inline-flex h-9 w-9 items-center justify-center rounded-circle transition-colors hover:bg-wf-bone-dark hover:text-wf-ink"
                  href="/cart"
                  data-testid="nav-cart-link"
                  aria-label="Warenkorb"
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </div>
      </header>
    </div>
  )
}
