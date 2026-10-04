# Werkfaden project rules

Purpose PORTFOLIO, Tier Standard; `docs/sdd/tier.md` locks ceremony. Follow parent workspace AGENTS.md and canonical SDD workflow.

Read ticket + `docs/sdd/contract.md` + `docs/sdd/state.md` per implementation session. Maximum 10 MVP tickets. No live payments or external publishing in bootstrap.

Official starter: Medusa backend in `apps/backend`, Next.js storefront in `apps/storefront`. Package manager `pnpm@10.11.1`; Node 22.22.1. Never create a second lockfile. `npm run check` is an entry point that delegates to pnpm, not an npm install instruction.

Medusa routing is file-based; business logic belongs to workflows/module services. No separate NestJS app or Supabase commerce database. Backend framework rules remain enabled. Use official docs matching installed versions before changing APIs.

New code follows parent readability/security/file-size standards; do not refactor inherited starter merely to change conventions. Keep MIT attribution. No editing build output or hand-editing lockfiles.

German UI; working name Werkfaden; every public page clearly says demo. Never invent operator/legal/product certification facts. Existing starter design first; landing redesign needs separate design intake.

Tests run sequentially on isolated test DB only. Auth/payments/uploads require reject-path tests and a fresh read-only security review before merge. No commits/push until explicitly requested by user.

Do not print `.env` values or credentials. `.env.template` is the public contract. Local setup may generate secrets privately; no production credentials or database modifications.
