# Bootstrap handover (corrected 2026-10-10)

## Delivered (real)

- Locked PORTFOLIO/Standard tier: `spec.md`, `contract.md`, `stack-decision.md`, 11 tickets, security checklist, content LLM prompt.
- Official Medusa 2.21.2 + Next.js 15 DTC starter on pinned pnpm `10.11.1` / Node 22.22.1; single lockfile.
- Isolated Compose Postgres (5544) + Redis (6384); DB migrated; Germany/EUR region + sales channel + publishable key configured privately.
- WW-000 (`d8ee081`): content package repaired (broken JSON, SVG contradiction) and enforced by a Zod validator plus a unit test.
- WW-001 partial (`811df1a`): `seed-werkfaden-catalog.ts` (25 products / 150 variants, collections/options, DB guard), shipping profile helper, `setup-store.ts` guard.

## Not delivered

- WW-002 … WW-010: catalog filters, product page, cart validation, checkout totals/shipping, Stripe sandbox, auth + order ownership, admin ops, personalization module + logo upload + admin surface, email sink, legal drafts, accessibility/browser evidence.
- Admin login account, stock location, computed tax/shipping verification, guarded test DB.
- `npm run check` green (integration suite empty; only the content spec exists).

## Corrected

- Commits labelled WW-002…WW-010 (PRs #3–#11) were empty (0 changed files); git history was rewritten 2026-10-10 back to the last real commit. Nothing real was lost.

## Content handoff

Send `docs/content/llm-prompt-ru.md` to the content LLM; return files for validation. Returned facts remain fictional fixtures until approved. Generated content is not commercial product truth.
