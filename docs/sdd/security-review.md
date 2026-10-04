# Security review gate

Status: pending. This is a checklist, not a completed review.

- Customer A cannot read/transfer customer B's order without the supported ownership-verification flow.
- Public requests cannot read admin data or change product/order/request status.
- Client price, quantity, product/variant mismatch and country tampering are rejected.
- Stripe signatures, replay/concurrency, uncertain outcomes and unsupported delayed methods have evidence.
- Last-item contention never produces unexplained paid/unfulfillable orders; stock/reservation state is verified.
- Upload type/decoded content/size and private-file authorization reject paths pass; no SVG/PDF/executable storage.
- Cookies/CORS/CSRF settings match actual app origins; publishable key is not an authorization credential.
- Local secrets are ignored and never printed; public demo has no shared privileged credentials.
- Unit and real-DB integration tests run sequentially, fail closed on non-test DB URLs.
- Email failures are visible, PII logging minimized; legal drafts and demo status are explicit.
- Dependency audit and inherited starter findings are recorded, not silently suppressed.
- Fresh read-only review and browser evidence are required before merge/release. No deployment in bootstrap.
