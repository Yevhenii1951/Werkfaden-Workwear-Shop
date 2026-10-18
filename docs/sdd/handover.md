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
npx --yes pnpm@10.11.1 run setup:store          # Germany/EUR store + publishable key
npx --yes pnpm@10.11.1 run setup:checkout       # tax, shipping, Stripe (sandbox)
npx --yes pnpm@10.11.1 run backend:dev          # :9000  (admin at /app)
npx --yes pnpm@10.11.1 run storefront:dev       # :8000
```

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
- Email notifications are written to `MAIL_SINK_DIR` (default
  `apps/backend/mail-sink`, gitignored) as `.eml` files.
- Personalization is a reviewed request, never a paid order.

## Open items

- WW-010 is the last planned MVP ticket; real launch needs revised
  purpose/tier, operator/legal facts, verified product facts and a separate
  operational/security gate.
- Product search is operational: `POST /store/search` exposes the configured
  product index and returns hits for indexed products. Covered by
  `ww-011-search.spec.ts` against the isolated integration database.
- `docs/sdd/state.md` holds per-session evidence; shipped history lives in PRs.
