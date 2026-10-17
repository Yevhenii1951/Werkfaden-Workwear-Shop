# Design intake — Werkfaden storefront (v2 "Industrial Premium")

Status: **proposed, awaiting approval**. No code is written until this is confirmed.

## 1. Design direction (in-house)

Robust, honest industrial workwear with calm editorial polish — bone paper,
charcoal ink, one accent. No reference theme retained.

## 2. Brand direction

"Industrial premium workwear" — robust, honest, made for tough days, but sold
with the calm editorial polish of a premium German shop. Bone paper + charcoal
ink + one high-visibility accent. No gradients-for-decoration, no glassmorphic
noise, no busy UI.

## 3. Design tokens

Defined once as CSS custom properties in `apps/storefront/src/styles/globals.css`
and mapped into `tailwind.config.js`; JSX uses token classes only.

### Color

| Token | Value | Use |
|---|---|---|
| `--wf-bone` | `#F3EFE7` | page background |
| `--wf-surface` | `#FBF8F2` | cards / raised panels |
| `--wf-ink` | `#16150F` | primary text, dark sections |
| `--wf-ink-soft` | `#3C4A57` | secondary text on light |
| `--wf-muted` | `#6B6455` | meta, captions |
| `--wf-line` | `#DAD3C4` | borders / dividers |
| `--wf-accent` | `#E2571E` | primary CTA, focus, key highlights (safety orange) |
| `--wf-accent-strong` | `#C8460F` | CTA hover / pressed |
| `--wf-accent-ink` | `#FFFFFF` | text on accent |
| `--wf-bone-dark` | `#E7E0D2` | subtle alternate section background |

Contrast: accent on bone and white-on-ink are AA for their sizes; body text
`--wf-ink` on bone is ~15:1. Every accent-on-accent and hover state is checked
in the a11y pass (NFR-A1).

### Type

Loaded with `next/font/google`, self-hosted by Next, no layout shift.

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display / headings | **Bricolage Grotesque** | 600, 700, 800 | industrial-editorial grotesque, variable; distinct from Inter |
| Body / UI | **Instrument Sans** | 400, 500, 600 | neutral, high legibility |
| Labels / numbers / meta | **JetBrains Mono** | 400, 700 | technical signature (eyebrows, codes, prices meta) |

Scale (clamp on big sizes): h1 `clamp(2.25rem, 5vw, 4rem)`, h2
`clamp(1.75rem, 3.5vw, 2.75rem)`, h3 `1.25rem`, body `1rem/1.6`, eyebrow
`.75rem` mono uppercase `letter-spacing .12em`.

Sentence case for headings (not ALL-CAPS); ALL-CAPS reserved for mono eyebrows.

### Shape / elevation / grid

- Radius: buttons + pills `9999px`; cards + images `14px`; inputs `10px`.
- Shadow: one soft token `0 1px 2px rgba(22,21,15,.06), 0 12px 32px -12px rgba(22,21,15,.18)`
  reused; no per-component shadow invention.
- Grid: homepage sections `max-w-[1280px]`, gutters `px-6 md:px-8`; product
  listing keeps the existing `content-container` (1440px) so the catalog and
  PDP are untouched. Vertical rhythm: section padding `py-16 md:py-24`.

## 4. Components (visual spec)

- **Button**: pill. Primary = accent bg / white text / hover `--wf-accent-strong`
  + 1px lift. Secondary = transparent + `--wf-line` border / ink text / hover
  bone-dark. Ghost = mono text link with underline sweep.
- **Badge / eyebrow**: mono uppercase pill, bone-dark bg, ink text; accent
  variant for "Neu"/highlight.
- **Card**: surface bg, 14px radius, 1px line border, soft shadow on hover,
  image with `overflow-hidden` and `scale(1.03)` on hover.
- **Collection tile**: image + ink overlay gradient + mono eyebrow + name +
  arrow; whole tile clickable, `focus-visible` accent ring.
- **Product card** (existing `product-preview`, restyled): bone bg, 14px radius,
  image zoom on hover, name (Instrument 500), price (mono), size/color chips,
  accent "Veredelung möglich" tag when applicable.
- **Stats strip**: 4 items, mono numbers, hairline dividers.
- **Step card**: big mono index `01/02/03`, title, one-line description.
- **Section heading block**: mono eyebrow + h2 + optional lead paragraph, left
  aligned.
- **Dark band**: ink background, bone text, accent CTA.

## 5. Homepage composition

1. **Demo banner** (kept, existing) — persistent "Demo-Shop".
2. **Header** — sticky, bone bg, ink text, pill nav, accent CTA; existing
   dropdown/menu behaviour and a11y kept.
3. **Hero** — eyebrow "Arbeitskleidung für Handwerk & Team" · h1
   "Arbeitskleidung, die hält, was der Tag verlangt." · lead · primary CTA
   "Kollektion entdecken" → `/store` · secondary "Veredelung anfragen" →
   `/personalization` · trust row (Größen XS–4XL · Verstärkte Nähte ·
   Team-Bestellung) · hero photo.
4. **Stats strip** — 5 Kollektionen · 25 Artikel · Größen XS–4XL · Lieferung
   innerhalb DE. (Honest, matches the seeded catalog — no invented metrics.)
5. **Kollektionen** — 5 photo tiles: T-Shirts, Poloshirts, Sweatshirts &
   Hoodies, Jacken & Westen, Arbeitshosen.
6. **Beliebte Artikel** — existing ProductRail, restyled product cards.
7. **So bestellen Sie** — 3 steps: Auswählen → Veredelung (optional) →
   Lieferung.
8. **Warum Werkfaden** — 4 benefit cards (Robust & langlebig, Passgenaue
   Größen, Veredelung möglich, Schnelle Lieferung) with line icons.
9. **Veredelung-Band** (dark) — links to `/personalization` (WW-009 feature).
10. **Für Teams** — short block on team orders + link to contact/help; no fake
    testimonials or invented ratings (fictional brand, portfolio project).
11. **CTA band** — "Kollektion entdecken" accent button.
12. **Footer** — existing, restyled to tokens; keeps demo + legal links.

## 6. Motion (homepage only, restrained)

Plain CSS + a single IntersectionObserver hook. No framer-motion (user rule). All
of it is disabled under `prefers-reduced-motion: reduce`.

1. Hero stagger: badge → h1 → lead → CTAs → trust row, `translateY(12px)→0`,
   500ms ease-out, 70ms stagger; hero image `scale(1.02)→1` over 700ms.
2. Section reveal: `fade-up` once at ~15% visibility, 450ms, 60ms child stagger.
3. Link underline sweep on nav + ghost links.
4. Card hover: image `scale(1.03)`, shadow lift, 200ms.
5. No count-up numbers, no parallax, no marquee, no autoplay carousel.

## 7. Free imagery (links)

Unsplash CDN links, verified to load (HTTP 200, real payload). I cannot render
images, so the exact subject is an assumption to be confirmed/swapped on review.

| Slot | URL |
|---|---|
| Hero | `https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=70` |
| T-Shirts | `https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=70` |
| Poloshirts | `https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=70` |
| Sweatshirts & Hoodies | `https://images.unsplash.com/photo-1618090584176-7132b9911657?auto=format&fit=crop&w=900&q=70` |
| Jacken & Westen | `https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=70` |
| Arbeitshosen | `https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=70` |
| Veredelung / CTA band | `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1400&q=70` |

Real product photos in the catalog stay as they are until the theme is approved;
then images move to a small placeholder map so they can be swapped in one place.

## 8. Scope / non-goals

- **In scope**: tokens + fonts + Tailwind mapping, storefront header/footer,
  homepage rebuild, product-card restyle, button/typography sweep across
  catalog, PDP, cart, checkout (visual only — no logic changes).
- **Not in scope**: Medusa backend, checkout/cart logic, the configurator idea
  (Werkfaden has no configurator), any new dependency, fake reviews/metrics,
  tests changes.
- **Kept**: demo banner, a11y fixes already merged, German copy, legal pages,
  instant-search gap (still open, not a design item).

## 9. Risks / decisions to confirm

1. **Accent hue**: safety orange `#E2571E` (recommended, industrial and
   distinct) vs. keeping an amber/yellow. -> which one?
2. **Fonts**: Bricolage Grotesque + Instrument Sans + JetBrains Mono (all
   Google Fonts, self-hosted by `next/font`). OK, or prefer a pair without a
   mono?
3. **Homepage container** 1280px vs. the current 1440px listing container: keep
   both (recommended) or unify?
4. **Testimonials**: skip fake reviews (recommended, honest) or add clearly
   labelled demo quotes?
5. Photo subjects are unverified visually — approve as-is or you swap the links.

## 10. Verification once approved

`npm run check` green and `npm run build` green, then browser pass at
360/768/1440 and an axe-core 4.10.3 re-run on `/de`, `/de/store`, a category,
a product and `/cart` to keep NFR-A1 at 0 serious/critical, with
`prefers-reduced-motion` checked.
