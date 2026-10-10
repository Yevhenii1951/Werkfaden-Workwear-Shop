# State — 2026-10-10 (WW-003 implemented, ready for review)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Delivered: WW-000 (d8ee081), WW-001 (811df1a), WW-002 MERGED to main (PR #12 01c7be4), WW-003 implemented on `feature/ww-003-product-page`.
- WW-003 (FR-3): Buyer selects an available variant.
  - Storefront: German variant UI (labels "Größe wählen"/"Farbe wählen", button texts "Variante wählen"/"Variante nicht verfügbar"/"Ausverkauft"/"In den Warenkorb"); `option-select` disables unavailable option values via server logic; `product-actions` uses URL `v_id` and new availability utilities.
  - Logic: new `lib/util/variant-availability.ts` — `isVariantInStock`, `findExactVariant`, `variantMatchesOptions`, `isOptionValueAvailable` (computations with explicit reject paths).
  - Components: new `modules/products/components/size-guide` renders table from `product.metadata.size_guide` (German column labels, measurements); product tabs extended with "Größentabelle".
  - Backend: seed writes `material` and `metadata.size_guide` (German column names for tops/outerwear/trousers), idempotent update checks.
  - Tests: 9 unit tests in `variant-availability.unit.spec.ts` (sold-out rejection, backorder/unmanaged, exact match, partial selection, unavailable options). All pass. Existing 18 unit tests still pass.
- Checks: `npm run check` GREEN (lint+typecheck+backend unit+storefront unit+integration empty harness). Storefront build green. No console errors observed.
- Browser-verified: Team T-Shirt Basic — option labels German, size guide table correct, disabled unavailable sizes/colors, URL has `v_id` after exact selection; Heavy T-Shirt — sold-out variants blocked ("Variante wählen" when incomplete, disabled unavailable values). Mobile bar shows selected variant/price, no horizontal overflow at 390px.
- Next: run two-axis review (Standards + Spec) for WW-003, open PR, merge after green (following WW-002 pattern).
