# State — 2026-10-25 (review remediation WW-019…WW-023, WW-027 merged)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Merged to `main`: WW-000..WW-023, WW-027 (PR #20–#37).
  - WW-019 (PR #32): personalization uploads land in gitignored `private/`, sharp input cap 40 MP.
  - WW-020 (PR #33): listing filter needs ONE variant to match price + stock; `listAllProducts` walks every page (100/page, cap 5 000).
  - WW-021 (PR #34): operator status changes are a compare-and-set (`quote/lib/status.ts`), race spec holds the row lock.
  - WW-022 (PR #35): the offer is presented as a one-off discount, not an agreed price.
  - WW-023 (PR #37): `npm run setup:demo` bootstraps an empty database end to end (store → search index → catalog → stock → checkout → promotions), shared `assertIsolatedLocalDb` guard reads `DB_NAME`, broken `backend:seed` removed. Rehearsal twice: identical counts, 0 errors, 25 documents indexed.
  - WW-027 (PR #36): option / option-value events resolve to their products again (`products.id`, `option.products.id`); the indexer used to crash on every option change.
- Evidence: `npm run check` green after each ticket (12 suites / 49 integration, 71 backend unit, 34 storefront unit); `npm run build:ui` green (41 pages).
- Process gap: a fresh read-only review by a second agent is unavailable (`subagent` → "Free usage limit reached"); every PR carries a self-review instead, and `LICENSE` stays as the user edited it (proprietary, conflicts with the "keep MIT" line in AGENTS.md — user decision).
- Gotcha: a fresh database has search-index records but no active version; the index is filled at boot, so scripted seeding needs `prepare-search` first.
- Gotcha: option/option-value rows reach products only through link tables, never a `product_id` column — `query.graph` answers `null` for a wrong path instead of failing.
- Dev services: backend :9000 (admin `/app`, log `/tmp/opencode/004-backend-dev.log`), storefront :8000, Postgres :5544, Redis :6384.
- Next: WW-024 docs truth pass (stale InstantSearch/cent-integers claims, README test counts) + OSM map behind consent; WW-025 payment/stock evidence (webhook replay, real last-unit race); WW-026 account data `no-store`; then phase B — `store.config.ts` as the single source for brand/region/currency/port, add-ons as removable folders, second demo shop on a clean database.
