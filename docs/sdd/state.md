# State — 2026-10-19 (WW-013 B2B quotes)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Merged to `main`: WW-000..WW-010 (PR #20/#21), storefront visual pass (PR #22 `7f9dc4c`), WW-012 (PR #23), WW-011 (PR #24), WW-015 (PR #25 `7c54d88`).
- Current branch: `feature/ww-013-b2b-quotes`; quote module, routes, workflows, migration, storefront `/angebote` and tests are uncommitted.
- WW-013: custom `quote` module (`QuoteRequest`/`QuoteRequestItem`, `draft→submitted→quoted→accepted|rejected→closed`). Store `POST/GET /store/quotes`, `GET /store/quotes/:id`, `POST /store/quotes/:id/accept`; admin list/detail/status under `/admin/quotes`. Access = owner customer OR one-time `x-quote-token` (else 404, no existence oracle). Accept issues a single-use 7-day core Promotion (amount derived server-side from the stored offer). `Migration20261019081928` applied to dev.
- Storefront: `/angebote` (form prefilled from cart + own-request history) and `/angebote/[id]` (status, offer, accept → code, link to cart); nav entry in header, mega-menu, side-menu, footer.
- Evidence: backend `tsc` clean, unit 55/55, `/angebote` storefront tsc+lint+unit 29/29; `ww-013-quotes.spec.ts` 7/7; `npm run check` green. Browser (German): cart → Anfrage → operator quotes 89,00 € via admin API → accept → `ANGEBOT-…` → code applies in cart (−50,25 €, total 5,90 €); promotion `limit:1`, campaign `ends_at` +7d; no-auth access → 404.
- Known limitation: concurrent double-accept is not transactional (documented; sequential transition map still rejects).
- Dev services: backend :9000 (admin `/app`), storefront :8000, Postgres :5544, Redis :6384. Integration needs `apps/backend/.env.test`.
- Next: WW-014 embroidery calculator (server-side rate table, estimate only). Open: Lighthouse baseline (NFR-P1), quote PDF/multi-user tiers (FR-14 remainder), fresh read-only security review recorded in the PR.
