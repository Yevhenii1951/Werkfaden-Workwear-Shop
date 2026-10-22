# Werkfaden project rules

Purpose PORTFOLIO, Tier Standard; `docs/sdd/tier.md` locks ceremony. Follow parent workspace AGENTS.md and canonical SDD workflow.

Read ticket + `docs/sdd/contract.md` + `docs/sdd/state.md` per implementation session. Maximum 10 MVP tickets. No live payments or external publishing in bootstrap.

Official starter: Medusa backend in `apps/backend`, Next.js storefront in `apps/storefront`. Package manager `pnpm@10.11.1`; Node 22.22.1. Never create a second lockfile. `npm run check` is an entry point that delegates to pnpm, not an npm install instruction.

Medusa routing is file-based; business logic belongs to workflows/module services. No separate NestJS app or Supabase commerce database. Backend framework rules remain enabled. Use official docs matching installed versions before changing APIs.

Before writing code, verify whether Medusa core or the official starter already does the job (check the installed package source and a live request); implement only what is genuinely missing. Do not re-implement cart/checkout/price/inventory logic that core already enforces.

New code follows parent readability/security/file-size standards; do not refactor inherited starter merely to change conventions. Keep MIT attribution. No editing build output or hand-editing lockfiles.

## Ticket surface and gate

Every ticket declares `Surface:` — `S` storefront (`apps/storefront/**`), `B` backend (`apps/backend/**`), `D` data/infra (migrations, seeds, env, docker, CI). Read `1_DEVELOPMENT_SDD/02_SDD_SYSTEM/medusa-workflow.md`.

- `S`: no `apps/backend` file in the same PR. Iterate with `npm run check:ui`, the storefront build (`npm run build:ui`) and the browser scenario; run the full `npm run check` once before the merge decision.
- `B`: full `npm run check`, reject-path tests for auth/payments/uploads, fresh security review.
- `D`: full `npm run check`, migration rehearsal on a throwaway DB, human sign-off.

The surface change mid-ticket is a stop, not a judgement call. Never upgrade a dependency inside a feature ticket; library facts come from Context7 or the official docs for the installed version, never from memory.

German UI; working name Werkfaden; every public page clearly says demo. Never invent operator/legal/product certification facts. Existing starter design first; landing redesign needs separate design intake.

Tests run sequentially on isolated test DB only. Auth/payments/uploads require reject-path tests and a fresh read-only security review before merge. No commits/push until explicitly requested by user.

Do not print `.env` values or credentials. `.env.template` is the public contract. Local setup may generate secrets privately; no production credentials or database modifications.
