# State — 2026-10-11 (WW-004 delivered by the template/core)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Delivered: WW-000, WW-001, WW-002 MERGED (PR #12), WW-003 MERGED to main (PR #13 3fda05d).
- WW-003 (FR-3): Buyer selects an available variant. German labels, URL `v_id`, disabled unavailable options, size guide from metadata, server-derived price. Pure availability utilities + 9 unit tests; `npm run check` GREEN.
- WW-004 (FR-4) on `feature/ww-004-cart`: delivered entirely by the Medusa template + core. The starter server actions handle add/update/remove; core enforces stock (`confirmVariantInventoryWorkflow` with the summed quantity), rejects unknown body fields (`unit_price`) and derives price from the pricing module. No custom backend code.
- WW-004 rejected approach: an earlier revision added a custom `cart-stock` middleware + `cart-guards` + 21 unit tests that duplicated core; removed (AGENTS.md: business logic belongs to workflows/module services). Error copy stays Medusa English (decision).
- WW-004 verified: `npm run check` and `npm run build` GREEN (backend unit 7, storefront unit 24); API throwaway cart (stock 20): add 20 → 200, add 1 more → 400 "Some variant does not have the required inventory", update 21 → 400, update 20 → 200, update 0 → line removed; browser cart qty 2 at stock 1 rejected by core, page intact. No inventory changed. Fresh read-only review still required before merge.
- WW-004 known core limitations (not our code): fractional quantity accepted; empty `variant_id` → HTTP 500; create-cart duplicate `items` not aggregated; cart API does not expose `inventory_quantity` for a line item variant.
- Open: WW-004 Cart (FR-4), WW-005 Checkout totals (FR-5), WW-006 Stripe sandbox (FR-6), WW-007 Account/orders (FR-7), WW-008 Admin ops (FR-8,FR-9), WW-009 Personalization (FR-10), WW-010 Legal/demo (FR-11–13). `/store` InstantSearch 404, integration harness empty, admin login missing, legal pages pending.
- Services: Postgres :5544, Redis :6384, backend :9000, storefront :8000 (cache cleared). Seeds write material + metadata.size_guide.
