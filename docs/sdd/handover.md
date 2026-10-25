# Handover — Werkfaden (demo)

A German workwear store on Medusa 2.21.2 + Next.js 15, built on the official
DTC starter. Portfolio project; product data and brand are fictional fixtures,
not commercial truth. Sandbox payments, local email only.

## Run it

Node 22.22.1, Docker, pnpm 10.11.1 (`npx --yes pnpm@10.11.1` if not installed;
never add a second lockfile).

```bash
npx --yes pnpm@10.11.1 install --frozen-lockfile
npm run setup:env
docker compose up -d --wait
npx --yes pnpm@10.11.1 --filter @dtc/backend exec medusa db:migrate --skip-scripts --execute-safe-links --execute-safe-search
npx --yes pnpm@10.11.1 run setup:demo            # store, search, catalog, stock, shipping/tax, codes
npx --yes pnpm@10.11.1 run backend:dev          # :9000  (admin at /app)
npx --yes pnpm@10.11.1 run storefront:dev       # :8000
```

`setup:demo` is the whole bootstrap and is idempotent; single steps
(`setup:store|catalog|inventory|checkout|promotions`) exist for debugging. Every
setup script writes only into a local database whose name matches `DB_NAME`
(`werkfaden_dev`); a second database needs both values overridden, plus
`SETUP_WRITE_STOREFRONT_KEY=false` so the running storefront keeps its key.
`scripts/rehearse-demo-setup.sh` proves the chain from scratch: fresh database,
migrate, run twice, compare row counts.

Secrets stay in gitignored `.env` files; `.env.template` is the public
contract. Stripe test-mode keys are required to pay for an order. Admin users
are created locally via Medusa's `user` command — no shared default password.

## Checks

```bash
npm run check          # lint + typecheck + unit + integration
npx --yes pnpm@10.11.1 run build
```

The integration suite needs `apps/backend/.env.test` (copy
`.env.test.template`, set `DB_PASSWORD`); it runs against a throwaway `_test`
database and refuses dev/prod databases.

## Boundaries (demo)

- No public deployment, live payments, real shipping or real email delivery.
- Legal pages are clearly labeled drafts with placeholder operator facts.
- B2B quotes (`/angebote`) create no order: accepting a quote only issues a
  single-use, 7-day discount code for the offered amount, which the buyer then
  applies in the normal cart/checkout. Operator pricing is set via the admin
  `/admin/quotes` status route (no operator UI yet).
- Email notifications are written to `MAIL_SINK_DIR` (default
  `apps/backend/mail-sink`, gitignored) as `.eml` files.
- Personalization is a reviewed request, never a paid order.
- The embroidery calculator (`/stickerei`, `POST /store/embroidery/estimate`) is
  a quoting aid: the server derives the surcharge from a demo rate table
  (`apps/backend/src/lib/embroidery/rate-table.ts`), the estimate never becomes
  a cart line, and it only prefills the personalization/quote forms.
- Discount codes are server-calculated local demo fixtures; see `README.md`.

## Open items

- WW-012 discount codes are server-calculated local demo fixtures; a real
  launch needs revised purpose/tier, operator/legal facts, verified product
  facts and a separate operational/security gate.
- Product search is operational: `POST /store/search` exposes the configured
  product index and returns hits for indexed products. Covered by
  `ww-011-search.spec.ts` against the isolated integration database.
- B2B quotes are delivered (`ww-013-quotes.spec.ts`). Accepting and the operator
  status change are compare-and-set writes (`quote/lib/acceptance.ts`,
  `quote/lib/status.ts`); `ww-016-quote-acceptance.spec.ts` and
  `ww-021-quote-status-race.spec.ts` hold both requests at the row lock and
  prove that exactly one succeeds.
- Embroidery estimates are delivered (`ww-014-embroidery.spec.ts`); the rate
  table is demo fixtures, not market prices.
- `docs/sdd/state.md` holds per-session evidence; shipped history lives in PRs.
