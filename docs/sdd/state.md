# State — 2026-10-22 (WW-017 + WW-018 merged)

- Purpose PORTFOLIO / Standard. Brand Werkfaden. de-DE, EUR, Germany only, sandbox payments.
- Merged to `main`: WW-000..WW-018 (PR #20–#30).
  - WW-017 (PR #29 `f40e584`): contact page `/[countryCode]/kontakt` with the fictional Kassel demo address, OpenStreetMap embed (no API key), `Kontakt (Demo)` footer block + footer link. Impressum/Datenschutz deliberately untouched.
  - WW-018 (PR #30 `16ca107`): header navigation — `Kollektion` (full-width mega menu, 1425 px at 1440, tiles `aspect-[16/10]`), `Alle Artikel` (link + hover/focus hint), `Leistungen` (dropdown with Logo-Veredelung, Angebote, Stickerei + descriptions + info-icon hints). One `openMenu` state, 200 ms close delay, chevron rotates for the open tab, Escape closes and returns the focus to the tab.
- Evidence: `npm run check` green (backend lint 4 warnings/0 errors, backend unit 69/69, storefront unit 29/29, integration 9 suites/39 tests); storefront build green. Browser-checked at 1440×900, 1024×800 and 390×844 (tab order, Escape, hint placement, mega menu width).
- Gotcha: `next build` needs the backend running (it fetches page data) and the storefront dev server stopped — `rm -rf apps/storefront/.next`, build, restart.
- Gotcha: a dropdown panel needs a positioned ancestor outside the centred nav row, otherwise it shrink-wraps to the row (565 px).
- Gotcha: `group-hover` matches ANY hovered `.group` ancestor — the info hint is a sibling of the entry link, not a child.
- Gotcha: a click that opens a panel must not toggle it again — the `focus` event opens the panel, so the click only opens.
- Dev services: backend :9000 (admin `/app`, log `/tmp/opencode/004-backend-dev.log`), storefront :8000 (log `/tmp/opencode/004-storefront-dev.log`), Postgres :5544, Redis :6384. Integration needs `apps/backend/.env.test`.
- Next: open follow-ups — accept no longer fires the quote module event (no subscriber today); FR-14 remainder (multi-user tiers, PDF); operator UI for quotes; the AI site helper (grounded, planned, not started); NFR-P1 Lighthouse baseline.
