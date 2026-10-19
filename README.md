<div align="center">

# Werkfaden

German workwear store with a separate team-logo request flow.

**Portfolio · Medusa + Next.js · Sandbox only**

</div>

## Status

Portfolio demo of a German workwear store built on Medusa + Next.js. The German catalog, checkout (Stripe sandbox), notifications, team-logo personalization and legal drafts are implemented. The catalog, checkout, ownership and notification paths are covered by tests and build checks; the legal pages are drafts, not verified legal text. This is still a demo, not a launchable shop: no live payments, shipping or operator facts.

Working name is not trademark-cleared. No trading company, real payments, commercial delivery guarantees or legal launch readiness implied.

## Buyer and operator flow

Browse → select size/color → cart → German delivery → sandbox payment → order history. Operator manages products/stock/orders in Medusa Admin. Separate logo requests are manually reviewed and are not paid orders.

## Structure

```text
apps/backend/       Medusa API and admin
apps/storefront/    Next.js storefront
docs/sdd/           spec, contract, tickets and evidence
docs/content/       content handoff prompt
scripts/            local setup helpers
compose.yaml        isolated local PostgreSQL and Redis
```

## Local setup

Node 22.22.1 (`nvm use`), Docker Compose, pnpm 10.11.1. If pnpm is not installed, use `npx --yes pnpm@10.11.1` in place of `pnpm`; do not add another lockfile.

```bash
npx --yes pnpm@10.11.1 install --frozen-lockfile
npm run setup:env
docker compose up -d --wait
npx --yes pnpm@10.11.1 --filter @dtc/backend exec medusa db:migrate --skip-scripts --execute-safe-links --execute-safe-search
```

Environment generator refuses to overwrite existing/partial setup. Secrets stay in ignored local files. PostgreSQL binds localhost:5544, Redis localhost:6384; neither is a production service.

Do not run inherited `initial-data-seed.ts`: it seeds a different multi-country catalog. Workwear seed/content mapping is WW-001/WW-002. Storefront needs a real publishable key tied to its sales channel in `apps/storefront/.env.local`.

On a new, empty local database, `npx --yes pnpm@10.11.1 run setup:store` creates the Germany/EUR store and writes its publishable key privately. It deliberately refuses a repeat/partial store setup rather than creating duplicates. It does not configure products, tax, shipping or Stripe.

Local admin account is not created yet. Create one with Medusa's `user` command using your own local credentials; never commit or share them. HTTP access to `/app` does not prove an admin login has been tested.

```bash
npx --yes pnpm@10.11.1 run backend:dev
npx --yes pnpm@10.11.1 run storefront:dev
```

Backend: localhost:9000; admin: localhost:9000/app; storefront: localhost:8000. Admin account creation is a local setup step; no shared/default admin password is embedded. Paying for an order needs Stripe **test-mode** keys: `STRIPE_API_KEY` + `STRIPE_WEBHOOK_SECRET` in `apps/backend/.env` and `NEXT_PUBLIC_STRIPE_KEY` in `apps/storefront/.env.local`; forward webhooks with `stripe listen`. Nothing is configured merely by installing the starter.

## Verification

```bash
npm run check
npx --yes pnpm@10.11.1 run build
```

Checks are strict and sequential. Missing tests/credentials are reported, never converted to green via `passWithNoTests` or ignored build errors. DB integration tests will use a separate guarded test DB. See `docs/sdd/state.md` for actual evidence; a scaffold is not a passing release.

The DB integration suite needs `apps/backend/.env.test` (gitignored): copy `apps/backend/.env.test.template` and set `DB_PASSWORD` to the `WORKWEAR_DB_PASSWORD` from `npm run setup:env`. The runner creates an ephemeral database on `DB_HOST:DB_PORT`; without this file `npm run check` fails at the integration step.

## Notifications (demo)

Email is local: order confirmations and team-logo acknowledgments are written as `.eml` files by a file-based notification provider (`apps/backend/src/modules/notification-sink`) instead of being delivered. Files land in `MAIL_SINK_DIR` (default `apps/backend/mail-sink`, gitignored). Send failures are logged and surface as `FAILURE` notification records, so a missing acknowledgment is observable rather than silent. No external mail provider is configured; nothing leaves the machine.

- Order confirmation (`order.placed`) and personalization acknowledgment (`personalization-request.created`) are idempotent per order/request.
- Provider options: `MAIL_FROM` and `MAIL_SINK_DIR` (see `apps/backend/.env.template`).

## Discount codes (local demo)

After `setup:store` and `setup:checkout`, run `npm run setup:promotions` to
create repeatable demo codes in the isolated local development database:

- `WERKFADEN10`: 10 % off eligible items.
- `WERKFADEN5`: 5 EUR off eligible items.
- `WERKFADEN-ABGELAUFEN`: expired test code.
- `WERKFADEN-LIMIT`: usage limit already exhausted for negative testing.

All codes are restricted to the local Deutschland/EUR demo region. They are
test fixtures, not real offers, and are not configured in a live shop.

## Legal drafts

`/impressum`, `/datenschutz`, `/agb` and `/widerruf` are **clearly labeled drafts** for the demo. Operator facts (company, address, register, VAT ID, contact) are explicit `[…]` placeholders and must be completed by a real operator. They are reachable from the footer and the persistent demo banner on every page, including checkout.

## Content

Give [the content prompt](docs/content/llm-prompt-ru.md) to another LLM and return the generated files for validation. Images need actual assets and provenance; prompts are not images. Legal content remains drafts/placeholders until confirmed by a real operator.

## Attribution

Based on Medusa's MIT-licensed [DTC starter](https://github.com/medusajs/dtc-starter), commit `15ef93da7d155ad990d8cc6db0296446fecbdfe6`. License preserved. Package versions and conventions begin with that upstream snapshot; no claim of a finished original ecommerce engine.
