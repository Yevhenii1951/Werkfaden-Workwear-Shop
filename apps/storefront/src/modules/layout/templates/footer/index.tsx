import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { clx } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import MedusaCTA from "@modules/layout/components/medusa-cta";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();

  return (
    <footer className="border-t border-wf-line bg-wf-bone-dark w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-20">
          <div>
            <LocalizedClientLink
              href="/"
              className="wf-display text-xl tracking-[-0.01em] text-wf-ink"
            >
              Werkfaden
            </LocalizedClientLink>
            <p className="mt-3 max-w-xs text-sm leading-6 text-wf-muted">
              Arbeitskleidung für Werkstatt, Baustelle und Team. Fiktive
              Demo-Marke ohne echte Bestellungen.
            </p>
          </div>
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-3">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="wf-eyebrow">
                  Kategorien
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return;
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li
                        className="flex flex-col gap-2 text-wf-muted txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="wf-eyebrow">
                  Kollektionen
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-wf-muted txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-y-2">
              <span className="wf-eyebrow">Rechtliches</span>
              <ul className="grid grid-cols-1 gap-y-2 text-wf-muted txt-small">
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/impressum"
                    data-testid="footer-impressum-link"
                  >
                    Impressum
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/datenschutz"
                    data-testid="footer-datenschutz-link"
                  >
                    Datenschutz
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/agb"
                    data-testid="footer-agb-link"
                  >
                    AGB
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base"
                    href="/widerruf"
                    data-testid="footer-widerruf-link"
                  >
                    Widerrufsbelehrung
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex w-full mb-16 justify-between text-wf-muted">
          <p className="text-sm">
            © {new Date().getFullYear()} Werkfaden (Demo). Alle Rechte
            vorbehalten.
          </p>
          <MedusaCTA />
        </div>
      </div>
    </footer>
  );
}
