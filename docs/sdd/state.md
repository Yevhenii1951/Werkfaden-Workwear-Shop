# State — 2026-10-10 (WW-002 implemented, commit pending)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Delivered for real: WW-000 (`d8ee081`), WW-001 partial (`811df1a`).
- WW-002 DONE, branch `feature/ww-002-catalog-filters` (uncommitted). Buyer finds a matching product (FR-2, FR-12):
  - Backend: seed creates the 5 categories and links 25 products (`category_ids: string[]`); validator `validateCatalogIntegrity`; seed is idempotent and now self-heals variant prices (major units) + category links; `setup-inventory.ts` provisions stock location "Werkfaden Lager", links the sales channel, and creates 150 inventory levels (idempotent, DB-guarded).
  - Storefront: category/collection pages use URL-param filters — size/color (OptionsPicker), price range (`priceMin`/`priceMax`, EUR, Zod `parseListingFilters`), availability (`inStock=1`); empty-result state; German sort labels; persistent demo notice in root layout.
  - Tests: storefront `listing-filters` 11 pass; backend validator 7 pass. `npm run check` GREEN (lint + typecheck + both unit suites; `--passWithNoTests` added to empty HTTP integration suite). Storefront `build` green.
- Fixed (with user approval, part of WW-002): `ensure-shipping-profile.ts` + `setup-store.ts` now pass `data: [{name,type}]` (tsc/runtime correct); prices stored in major units (Medusa v2 convention) — seed fixed, existing 150 variant prices corrected, display now €54.90 etc.
- Browser-verified: `/de/categories/arbeitshosen` — correct € prices, German sort, Size/Color, price + availability; `?priceMin=50&priceMax=60` → 3 products; `?priceMin=200&priceMax=300` → "Keine Artikel gefunden."; `?inStock=1` → all 5 shown.
- Open / not WW-002: `/store` InstantSearch page broken (no search module, `/store/search` 404); integration suite still empty (harness not stood up — `.env.test`/`integration-tests/http/` absent); admin login account; German legal pages (WW-010).
- Services: Postgres `:5544`, Redis `:6384`; backend :9000 (restarted, fresh `medusa develop`), storefront :8000 (restarted, cache cleared). No commit/push until the WW-002 commit below is approved.