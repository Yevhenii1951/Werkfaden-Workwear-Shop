# Werkfaden — portfolio case study

A German workwear store with a separate team-logo request flow, built on the
Medusa 2.21.2 + Next.js DTC starter. This is a portfolio project; product data
and brand are fictional fixtures, not commercial truth.

## Problem

Small workwear shops sell standard items and, alongside them, individually
embroidered or printed items with a customer logo. The two need different
flows: the standard item is an ordinary add-to-cart purchase, while the logo
item is a quote request that a person reviews before any price is agreed.
Mixing them in one flow misleads customers about what a click commits them to.

## Approach

- Standardised commercial behaviour on Medusa core (cart, pricing, inventory,
  tax, checkout, Stripe, admin) instead of re-implementing it. Only genuine
  gaps were written: catalog seed, Germany-only shipping/tax setup, a
  file-based notification provider, and the personalization module.
- Kept personalization out of the cart: it is its own action with a clear
  "request, not an order" expectation, reviewed by an operator.
- German-first storefront with a persistent demo banner and legal pages that
  are honest about being drafts.

## What is implemented

- **Catalog**: 25 products / 150 variants with collections, options and stock.
- **Purchase**: cart → German delivery → Stripe **sandbox** payment → order.
- **Order ownership**: cross-customer reads blocked; guest receipt limited to
  guest orders where Medusa keeps the confirmation based on `has_account: false`.
- **Operator path**: Medusa Admin handles products, stock and orders; the
  restock/cancel/refund stock policy is defined and tested.
- **Personalization**: logo upload with allowlisted raster types, decoded
  content validation and a 5 MiB limit; private storage; operator review with a
  status workflow.
- **B2B quotes**: a buyer requests an offer for larger quantities, an operator
  enters the offered total, and the acceptance hands out a single-use promotion
  code for exactly that amount.
- **Notifications (demo)**: order confirmation and logo acknowledgment written
  locally as `.eml` files; send failures surface as `FAILURE` records.
- **Legal drafts**: `/impressum`, `/datenschutz`, `/agb`, `/widerruf` with
  explicit placeholder operator facts.

## Technical decisions

- **Medusa core first.** Verified in the installed package source and against
  live requests before writing code; core already enforces cart, checkout,
  price and inventory logic.
- **Test-DB harness.** Vitest/Jest integration specs run sequentially against a
  throwaway `_test` database; production/development databases are refused.
- **File-based mail sink over a real provider.** All email stays local until a
  provider is explicitly configured; the seam makes that swap a small change.
- **Workflow-level events.** Notifications are triggered from Medusa events
  (`order.placed`, `personalization-request.created`) with idempotency keys.
- **Compare-and-set instead of read-then-write.** Accepting a quote moves the
  row from "quoted" to "accepted" in a single conditional `UPDATE` that only
  matches while the row still is "quoted". The winner of that row issues the
  offer code, every loser is rejected without creating a promotion, and a
  failed workflow hands the quote back to the buyer.

## Evidence

- `npm run check` (lint + typecheck + unit + integration) and
  `pnpm run build` are the merge gate; both pass.
- Integration specs cover payment retry, provider rejection, last-item stock
  protection, order ownership and admin operations.
- The quote acceptance is proven by a concurrency spec: a row lock forces two
  accepts to overlap, and the test asserts that exactly one succeeds, exactly
  one promotion exists and the stored code is the winner's.

## Demo limitations

- No live payments (Stripe test mode), no real email delivery, no shipping
  label, no public deployment.
- Legal pages are drafts; operator facts are placeholders.
- Product data and brand are fictional and not trademark-cleared.
- Personalization, notifications and legal content require a real operator and
  a separate operational/security gate before any launch.
- A crash between reserving an accepted quote and creating its offer code
  leaves the quote "accepted" without a code; there is no recovery job.
