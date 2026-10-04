# Application contract

## Trust boundaries

Next.js presents Medusa API data and uses Server Actions for mutations. Medusa services/workflows calculate prices, tax, delivery, payments and stock. Browser prices/roles/user IDs are never authority. No raw commerce tables maintained in a second database.

Admin authorization uses Medusa admin auth. Customer order reads enforce ownership at the backend operation. Publishable keys identify a sales channel, not customer authorization. Public demo must not expose admin credentials.

## Checkout and inventory

One Germany-only EUR region, one stock location, managed inventory enabled and backorders disabled. Core Medusa order placement creates reservations; fulfillment releases reservations and subtracts stocked quantity. Cart add is not a promise of reservation.

Final checkout revalidates variants and quantities. Stripe callback verification and idempotency use the supported provider/core workflow; do not add a parallel custom order creator. Verify failures/duplicates against real isolated test storage.

Demo prices are gross. Imported price configuration and tax-inclusive flags must agree with region/tax setup. Shipping free threshold is based on eligible item gross total; delivery costs excluded. Verify boundary EUR 99.99 / 100.00 before closing checkout.

Refund does not implicitly promise restocking: fulfillment/cancellation/return disposition determines stock action. Ticket WW-008 defines and tests the supported operator scenario.

## Personalization module (WW-009)

Module owns `PersonalizationRequest`: generated ID, optional authenticated customer relation, contact name/email, optional company, server-verified product/variant relation, positive integer quantity, bounded comment, private file reference, status, timestamps.

Statuses: submitted → reviewing → quoted / rejected → closed. Request status is not order/payment status. Only admin changes status; public submissions do not permit arbitrary customer attachment or hidden-file reads.

Zod validation at custom endpoint/action boundaries. Logo upload: PNG/JPEG/WebP only, decoded raster validation, max 5 MiB, one file, random storage identifier; private delivery for authorized admin. No client filename used as filesystem path. Add a bounded request limiter; never log file content or unnecessary contact data.

Durable request/file creation and acknowledgment must handle partial failure. User acknowledges rights to supplied logo; no marketing consent implied. Retention period stays an explicit demo policy/open production decision.

## Content handoff

`docs/content/llm-prompt-ru.md` requests 25 products / 150 variants. content_id and SKU are stable handoff keys, not Medusa database IDs. The content CSV is not a native Medusa import. WW-001/WW-002 own mapping, validation and repeatable seeding without duplicate catalog entries.

No shipping-country, price, tax or stock truth is embedded in marketing text without corresponding shop configuration. Uploaded content is untrusted until validated.

## Verification and release

Root `npm run check` delegates to the pinned manager, executes lint/typecheck and applicable tests sequentially. Root build is separate and mandatory for bootstrap/release.

Integration tests use a distinct test database and fail closed outside the test DB namespace. Review required before merging auth/payment/upload work. UI scenarios and security findings have evidence, never merely a green unit count.

Inherited starter limitations, unavailable credentials and skipped checks must be recorded in state/handover. No claim of fully operational payment/email until provider configured and exercised.
