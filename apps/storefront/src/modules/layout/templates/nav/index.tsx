import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Search from "@modules/layout/components/search"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b border-wf-line duration-200 bg-wf-bone/90 backdrop-blur">
        <nav className="content-container txt-xsmall-plus text-wf-ink-soft flex items-center justify-between w-full h-full text-small-regular">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="wf-display text-xl tracking-[-0.01em]"
              data-testid="nav-store-link"
            >
              Werkfaden
            </LocalizedClientLink>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <Search />
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="wf-link-sweep hover:text-wf-ink"
                href="/store"
                data-testid="nav-store-catalog-link"
              >
                Kollektion
              </LocalizedClientLink>
              <LocalizedClientLink
                className="wf-link-sweep hover:text-wf-ink"
                href="/personalization"
                data-testid="nav-personalization-link"
              >
                Logo-Veredelung
              </LocalizedClientLink>
              <LocalizedClientLink
                className="wf-link-sweep hover:text-wf-ink"
                href="/account"
                data-testid="nav-account-link"
              >
                Konto
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-wf-ink flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Warenkorb (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
