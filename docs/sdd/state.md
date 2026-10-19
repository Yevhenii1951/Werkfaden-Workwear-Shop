# State — 2026-10-19 (WW-015 product imagery)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Merged to `main`: WW-000..WW-010 (PR #20/#21), storefront visual pass (PR #22 `7f9dc4c`), WW-012 discount codes (PR #23), WW-011 product search coverage (PR #24).
- Current branch: `feature/ww-015-product-imagery`; hero opacity + card-image changes are uncommitted.
- WW-011: `/store` InstantSearch verified operational; `integration-tests/http/ww-011-search.spec.ts` (5 cases) covers a hit, an unrelated-query miss, and the unknown-index / missing-key / malformed-body rejects.
- WW-012: Medusa server-calculated promos, local demo fixtures, German rejection handling, applied-code removal. `npm run setup:promotions` is idempotent against the guarded local dev DB.
- WW-015: hero background opacity 0.5 (`wf-media-in` keyframe ends at that value); 12 supplied PNGs converted to WebP under `apps/storefront/public/images/workwear/`; every product card resolves a distinct image via `getProductCardImageUrl` (no repeats within a category page).
- Dev services: backend :9000 (admin `/app`), storefront :8000, Postgres :5544, Redis :6384. Integration config needs `apps/backend/.env.test`; config-time env vars must be set at spec module scope (see WW-010).
- Phase 2: WW-013 B2B quotes (high; custom `quote` module, status map, offer → single-use promotion code → core checkout) and WW-014 embroidery calculator (server-side rate table, estimate only, never a cart line).
- Open: Lighthouse baseline (NFR-P1), fresh read-only review of the visual pass; FR-14 remainder deferred. Real launch needs purpose/tier revision + security gate.
