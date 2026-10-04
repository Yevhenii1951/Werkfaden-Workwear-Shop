# Werkfaden business spec

## Users and stories

- Buyer: find everyday workwear, choose a fitting variant and place a sandbox order.
- Returning customer: authenticate and view only their own orders.
- Team buyer: submit a separate logo-personalization request for manual review.
- Operator: maintain products/stock and process orders and requests.

## Functional requirements

| ID | Priority | Observable behavior |
| --- | --- | --- |
| FR-1 | Must | A fresh local setup exposes the storefront and admin with seeded German/EUR demo catalog and one stock location. |
| FR-2 | Must | Buyer browses categories and filters by size, color, price and availability; invalid combinations have no purchasable result. |
| FR-3 | Must | Product page shows images, description, size guide and server-derived variant price/availability. |
| FR-4 | Must | Cart supports add/update/remove; invalid quantity or unavailable stock is rejected server-side. |
| FR-5 | Must | Checkout accepts German addresses and shows item, tax, shipping and final totals before payment. Demo shipping is EUR 5.90 gross, free from EUR 100 gross of eligible items. |
| FR-6 | Must | Stripe test payment creates a correct order; duplicate callbacks do not create duplicate orders; abandoned/failed payment does not appear as paid. |
| FR-7 | Must | Account registration/login/logout and order history work; users cannot access another customer's order or an admin operation. |
| FR-8 | Must | Operator creates/edits product variants and stock; changes become visible in storefront. |
| FR-9 | Must | Operator fulfills/cancels a demo order and initiates a supported sandbox refund; stock/reservation effects follow explicit policies. |
| FR-10 | Must | Buyer submits personalization request with contact, item, quantity and one logo file; admin can read/update its status. Submission is not a sale and does not reserve inventory. |
| FR-11 | Must | Buyer receives an order confirmation and personalization acknowledgment through a local email sink; failures are observable. |
| FR-12 | Must | Store is German-first, displays a persistent demo notice, and links to clearly labeled legal drafts with missing operator facts. |
| FR-13 | Should | Completed work has reproducible checks, browser evidence, setup instructions and a portfolio case study. |
| FR-14 | Later | Company accounts, negotiated price lists, repeat ordering, quote acceptance/payment and automated embroidery pricing. |

## Non-functional requirements

- NFR-S1: all protected data/mutations have operation-level authentication/role/ownership enforcement; reject tests for cross-user order access and admin access pass.
- NFR-S2: personalization uploads enforce allowlisted raster types, decoded-content validation, 5 MiB limit, random storage names and private access; SVG/PDF are not accepted in MVP.
- NFR-M1: zero duplicate orders or negative stock in the agreed duplicate-callback and last-item test scenarios against an isolated test DB. No mocked-only evidence for these scenarios.
- NFR-A1: keyboard purchase path works; zero serious/critical axe findings on catalog, product, cart and checkout at the release gate.
- NFR-R1: main flows work at 360, 768 and 1440 CSS-pixel widths without page-level horizontal overflow.
- NFR-P1: before/after performance recorded for the storefront catalog on a fixed mobile Lighthouse profile; no invented score target before baseline.
- NFR-O1: no secret in tracked files; a clean local environment can follow README; DB tests refuse production/development DBs.

## UX acceptance

- UX1: impossible/sold-out variants cannot be added; no success toast before confirmed server success.
- UX2: retry preserves appropriate customer input; uncertain payment outcome directs buyer to verification rather than a second blind purchase.
- UX3: tax display, demo delivery terms and actual checkout calculation agree; delivery region is Germany only.
- UX4: personalization and ordinary purchase are separate actions with explicit expectations.

## Delivery budget and scope

- Standard, 10 vertical tickets. No fixed deadline or guaranteed estimate supplied by user.
- Payment keys are sandbox-only; all email is local until an explicitly authorized provider is configured.
- No live sales, POS/TSE/DATEV, accounting, real shipping labels, marketplace, loyalty, newsletter, reviews, multilingual CMS or premium landing redesign.
- Real launch requires revised purpose/tier, operator/legal facts, verified product facts and a separate operational/security gate.

## Success metrics and open items

- M1: documented browser purchase reaches the correct admin order and customer history.
- M2: negative authorization, payment retry and stock scenarios have passing evidence.
- M3: operator can independently edit a variant and process a test order.
- OQ1: content returned by the other LLM still requires validation and approval; it is not commercial product truth.
- OQ2: public demo hosting, brand name and real contact details remain undecided.
