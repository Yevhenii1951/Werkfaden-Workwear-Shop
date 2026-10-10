# State — 2026-10-10 (integrity repair)

- Purpose PORTFOLIO / Standard. Working brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Delivered for real (revised view below):
  - WW-000 — content package repaired and enforced by a Zod validator + unit test — commit `d8ee081` (PR #1).
  - WW-001 (partial) — bootstrap + repeatable catalog seed (25 products / 150 variants), shipping profile and store-setup guard — commit `811df1a` (PR #2).
- Not started: WW-002 … WW-010 (catalog filters, product page, cart validation, checkout totals, Stripe, auth/orders, admin ops, personalization module/uploads, email sink, legal drafts, polish). Their tickets are already marked `planned`.
- `npm run check` is not green: only the content-validator spec exists (`test:unit`), the integration suite is empty. Not bypassed, not claimed green.
- No test was added for this repair — it changes docs/history only, not computed behaviour.

## History repair (2026-10-10)

- Commits `2cf874e`…`d2a4c30` (labelled WW-002…WW-010, PRs #3–#11) changed **0 files**: their tree equals the seed tree `9c9a4bd`, and every `origin/feature/ww-*` branch pointed at that same tree. The "merged" PRs were empty placeholders.
- `main` was reset to `811df1a` and the remote rewritten. No real code was lost — there was none after PR #2.
- PRs #3–#11 still show as *Merged* on GitHub (cannot be unmerged); they contain no changes.
- `docs/sdd/tickets/` was already honest (`WW-000`/`WW-001` done/partial, the rest `planned`); only the git history contradicted it.

- Next: implement the vertical slice for real, one ticket at a time, starting at WW-002.
- Local services: Postgres `localhost:5544`, Redis `localhost:6384`; backend `:9000`, storefront `:8000`.
