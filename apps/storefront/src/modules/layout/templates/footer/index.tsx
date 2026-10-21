import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DemoContact from "@modules/layout/components/demo-contact"
import FooterNewsletter from "@modules/layout/components/footer-newsletter"
import MedusaCTA from "@modules/layout/components/medusa-cta"

const LEGAL_LINKS = [
  { label: "Impressum", href: "/impressum", testid: "footer-impressum-link" },
  {
    label: "Datenschutz",
    href: "/datenschutz",
    testid: "footer-datenschutz-link",
  },
  { label: "AGB", href: "/agb", testid: "footer-agb-link" },
  {
    label: "Widerrufsbelehrung",
    href: "/widerruf",
    testid: "footer-widerruf-link",
  },
]

const ACCOUNT_LINKS = [
  { label: "Anmelden", href: "/account" },
  { label: "Warenkorb", href: "/cart" },
  { label: "Logo-Veredelung", href: "/personalization" },
  { label: "Stickerei-Preisrechner", href: "/stickerei" },
  { label: "Angebote", href: "/angebote" },
  { label: "Kontakt", href: "/kontakt" },
]

const headingClass =
  "wf-display text-[13px] tracking-[0.14em] text-wf-bone"
const linkClass =
  "text-sm text-wf-bone-dark/75 transition-colors hover:text-wf-bone"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full border-t border-wf-bone/15 bg-wf-ink text-wf-bone">
      <div className="content-container">
        {/* Newsletter */}
        <div className="grid gap-6 border-b border-wf-bone/15 py-14 md:grid-cols-2 md:items-center md:gap-10">
          <div>
            <h2 className="wf-display text-2xl leading-none text-wf-bone md:text-[28px]">
              Werkstatt-Post
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-wf-bone-dark/75">
              Neue Kollektionen, Pflegetipps und Angebotshinweise. Diese Demo
              versendet keine echten E-Mails.
            </p>
          </div>
          <FooterNewsletter />
        </div>

        {/* Five columns */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="flex flex-col gap-4">
            <span className={headingClass}>Marke</span>
            <LocalizedClientLink
              href="/"
              className="wf-display text-xl text-wf-bone"
            >
              Werkfaden
            </LocalizedClientLink>
            <p className="max-w-xs text-sm leading-6 text-wf-bone-dark/75">
              Arbeitskleidung für Werkstatt, Baustelle und Team. Fiktive
              Demo-Marke ohne echte Bestellungen.
            </p>
          </div>

          {collections && collections.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className={headingClass}>Kollektionen</span>
              <ul className="flex flex-col gap-2.5">
                {collections.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      className={linkClass}
                      href={`/collections/${c.handle}`}
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {productCategories && productCategories.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className={headingClass}>Kategorien</span>
              <ul
                className="flex flex-col gap-2.5"
                data-testid="footer-categories"
              >
                {productCategories
                  .slice(0, 6)
                  .filter((c) => !c.parent_category)
                  .map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className={linkClass}
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <span className={headingClass}>Service &amp; Konto</span>
            <ul className="flex flex-col gap-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.label}>
                  <LocalizedClientLink
                    className={linkClass}
                    href={link.href}
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <LocalizedClientLink
                    className={linkClass}
                    href={link.href}
                    data-testid={link.testid}
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <DemoContact />
          </div>
        </div>

        {/* Bottom bar: copyright | credit (centered) | CTA */}
        <div className="grid grid-cols-1 gap-3 border-t border-wf-bone/15 py-6 text-xs text-wf-bone-dark/60 xsmall:grid-cols-[1fr_auto_1fr] xsmall:items-center">
          <p className="xsmall:justify-self-start">
            © {new Date().getFullYear()} Werkfaden (Demo). Alle Rechte
            vorbehalten.
          </p>
          <p className="text-center">Webentwicklung: Yevhenii Riabokon</p>
          <div className="xsmall:justify-self-end">
            <MedusaCTA />
          </div>
        </div>
      </div>
    </footer>
  )
}
