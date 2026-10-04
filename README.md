<div align="center">

# Werkfaden

German workwear store with a separate team-logo request flow.

**Portfolio · Medusa + Next.js · Sandbox only**

</div>

## Status

SDD baseline and official starter scaffold are in place. This is not a completed store: German catalog import, checkout verification, Stripe sandbox, notifications and personalization remain tracked work.

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

Backend: localhost:9000; admin: localhost:9000/app; storefront: localhost:8000. Admin account creation is a local setup step; no shared/default admin password is embedded. Stripe and email are not configured merely by installing the starter.

## Verification

```bash
npm run check
npx --yes pnpm@10.11.1 run build
```

Checks are strict and sequential. Missing tests/credentials are reported, never converted to green via `passWithNoTests` or ignored build errors. DB integration tests will use a separate guarded test DB. See `docs/sdd/state.md` for actual evidence; a scaffold is not a passing release.

## Content

Give [the content prompt](docs/content/llm-prompt-ru.md) to another LLM and return the generated files for validation. Images need actual assets and provenance; prompts are not images. Legal content remains drafts/placeholders until confirmed by a real operator.

## Attribution

Based on Medusa's MIT-licensed [DTC starter](https://github.com/medusajs/dtc-starter), commit `15ef93da7d155ad990d8cc6db0296446fecbdfe6`. License preserved. Package versions and conventions begin with that upstream snapshot; no claim of a finished original ecommerce engine.
