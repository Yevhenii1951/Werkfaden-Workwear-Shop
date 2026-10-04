# Stack decision

## Selected

- Official Medusa DTC monorepo: `apps/backend` + `apps/storefront`.
- Medusa 2.21.2, Next.js 15.5.24 and dependencies from upstream lockfile; do not upgrade speculatively during bootstrap.
- Node 22.22.1 LTS for reproducibility; pnpm 10.11.1 from upstream packageManager. Single lockfile.
- PostgreSQL 16 + Redis 7 locally in Docker; Medusa owns commerce persistence. No Supabase auth/RLS and no separate NestJS service.
- Medusa Admin for product/order operations; custom admin UI only for personalization requests.
- Stripe sandbox provider in its payment ticket. Mailpit local sink in notifications ticket.

## Why

Use maintained commerce workflows instead of repairing Jirah pricing/payment/stock behavior. Portfolio-specific work is German store configuration, integration verification and a small personalization module.

## Upstream provenance

- Source: https://github.com/medusajs/dtc-starter
- Commit: 15ef93da7d155ad990d8cc6db0296446fecbdfe6
- MIT license preserved in LICENSE.
- Official install reference: https://docs.medusajs.com/resources/create-medusa-app
- Starter reference: https://docs.medusajs.com/resources/nextjs-starter
- Copied starter is a baseline, not evidence of completed workwear requirements or production readiness.

## Boundaries and maintenance

Starter code retains upstream conventions initially. Workspace standards govern new/modified code; inherited deviations are tracked rather than mechanically rewriting the starter. Medusa recommended lint rules remain enabled.

No headless CMS, analytics, cloud email or new skills/plugins installed. Medusa docs are read from official version-matched sources before framework code changes.

## Hosting

Local-first now. Later: storefront can use Vercel; Medusa backend, PostgreSQL and Redis need separately suitable hosting. Do not represent Vercel as hosting the entire stack. No deployment or paid subscription authorized in this phase.
