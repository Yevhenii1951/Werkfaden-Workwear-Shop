# Bootstrap handover

## Delivered

Locked PORTFOLIO/Standard tier, spec/stack/contract, 10 vertical tickets, security review checklist and detailed content LLM prompt. Official starter, pinned dependency lockfile, isolated Compose services, private local env generation, database migrations and Germany/EUR channel/region setup. Separate local git repository without commits or remote.

Removed starter build bypasses, fixed inherited lint errors without disabling rules, retained three hooks warnings for the relevant tickets. Unused gift-card/discount stubs were removed (no call sites); storefront error catches narrowed to unknown and address payload typed. Size/color/filter/checkout business behavior has not been verified yet.

## Evidence

- `npx --yes pnpm@10.11.1 install --frozen-lockfile` — exit 0.
- `docker compose up -d --wait` — exit 0, both services healthy.
- Medusa `db:migrate --skip-scripts --execute-safe-links --execute-safe-search` — exit 0 on isolated local DB.
- Medusa `exec ./src/scripts/setup-store.ts` — exit 0; key written privately, not printed.
- lint and typecheck — exit 0, three inherited React Hook warnings.
- `npx --yes pnpm@10.11.1 run build` — exit 0 for both apps with type/lint errors enforced.
- HTTP `/health`, `/app`, storefront root and `/de/store` — 200; this is HTTP smoke, not a browser test.
- `npm run check` — exit 1 at `test:unit`: no tests found. Integration was not run. No `passWithNoTests` workaround.

## Not yet delivered

Admin credentials/login, product/variant content seed and stock location, German UI, computed tax/shipping verification, Stripe sandbox, real DB reject/concurrency tests and test DB fuse, local email sink/provider, personalization module/uploads/admin UI, legal drafts, security review, accessibility and full buyer/operator browser evidence.

No portfolio release, live trading or public deployment approved/completed. Local event bus/locking are inherited in-memory defaults; configure and verify persistent modules before demonstrating restart/concurrency guarantees.

## Content handoff

Send `docs/content/llm-prompt-ru.md` to the content LLM. Return brand/demo policies/categories/one product first, then full JSON+CSV and image manifest. No content or legal claims become approved simply because generated.
