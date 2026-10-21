import { COLLECTION_LINKS } from "@modules/layout/lib/collection-links"
import { SERVICE_LINKS } from "@modules/layout/lib/service-links"

type MenuLink = {
  label: string
  href: string
  testid?: string
}

type MenuGroup = {
  title: string
  links: MenuLink[]
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    title: "Kollektion",
    links: [
      { label: "Alle Artikel", href: "/store", testid: "menu-store-link" },
      ...COLLECTION_LINKS.map((collection) => ({
        label: collection.title,
        href: `/collections/${collection.handle}`,
      })),
    ],
  },
  {
    title: "Leistungen",
    links: SERVICE_LINKS.map((service) => ({
      label: service.label,
      href: service.href,
      testid: service.testid,
    })),
  },
  {
    title: "Rechtliches",
    links: [
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
