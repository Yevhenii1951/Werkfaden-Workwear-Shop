# State — 2026-10-18 (WW-012 verified)

- Purpose PORTFOLIO / Standard. WW-000..WW-010 merged; main at PR #22. WW-011 remains separate and unmerged.
- Current branch: `feature/ww-012-discount-codes`, based on `main`; user authorized commit, push, and merge on 2026-10-18. First independent review findings fixed; second fresh review required before merge.
- WW-012 adds Medusa server-calculated promos, local fixtures, German rejection handling, and applied-code removal.
- `npm run setup:promotions` ran twice against guarded local `127.0.0.1/werkfaden_dev`; second run confirmed idempotency.
- Focused WW-012 integration tests: 6/6 passed. `npm run check`: passed; backend unit 39, storefront unit 29, HTTP integration 5 suites/21 tests. `npm run build`: passed.
- Browser at 390/1440 px: 24,90 € → 22,41 € with `WERKFADEN10`; removal restored 24,90 €. Unknown and expired codes showed the German error with unchanged totals; no horizontal overflow. Cart cleared afterward.
- Dev services: backend :9000, storefront :8000, Postgres :5544, Redis :6384. Integration config needs `apps/backend/.env.test`.
