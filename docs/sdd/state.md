# State — 2026-10-19 (WW-013 B2B quotes merged)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Merged to `main`: WW-000..WW-010 (PR #20/#21), storefront visual pass (PR #22 `7f9dc4c`), WW-012 discount codes (PR #23), WW-011 product search coverage (PR #24), WW-015 product imagery (PR #25), WW-013 B2B quotes (PR #26 `ec06edc`).
- WW-013: custom `quote` module (`QuoteRequest`/`QuoteRequestItem`, `draft→submitted→quoted→accepted|rejected→closed`; migration `Migration20261019081928`). Store `POST/GET /store/quotes`, `GET /store/quotes/:id`, `POST /store/quotes/:id/accept`; admin `GET /admin/quotes`, `GET /admin/quotes/:id`, `POST /admin/quotes/:id/status` (quoted|rejected|closed only). Access = owner customer OR one-time `x-quote-token`, else uniform 404. Accept issues a single-use, 7-day core Promotion whose value derives server-side from the stored offer. Storefront `/angebote` + `/angebote/[id]`; nav entry in header/mega-menu/side-menu/footer.
- Evidence: backend `tsc` clean, unit 55/55, `ww-013-quotes.spec.ts` 7/7, `npm run check` green; storefront tsc+lint+unit 29/29. Browser (DE): cart → Anfrage → operator quotes 89,00 € → accept → code → cart `Rabatt −50,25 €`, total 5,90 €; no-auth access → 404. Fresh read-only review: merge-safe.
- Tracked follow-ups: atomic (compare-and-set) accept guard against concurrent double-accept; FR-14 remainder (multi-user tiers, PDF).
- Dev services: backend :9000 (admin `/app`), storefront :8000, Postgres :5544, Redis :6384. Integration needs `apps/backend/.env.test`.
- Next: WW-014 embroidery calculator (server-side rate table, estimate only, never a cart line). Open: Lighthouse baseline (NFR-P1).
