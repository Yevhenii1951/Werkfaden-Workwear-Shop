<div align="center">

# Werkfaden

**Arbeitskleidung, die hält, was der Tag verlangt.**

Deutscher Workwear-Shop mit eigenem Veredelungs- und Angebots-Flow.<br/>
Medusa-2-Backend · Next.js-15-Storefront · Stripe im Sandbox-Modus

![Medusa](https://img.shields.io/badge/Medusa-2.21-000000?logo=medusa&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-0891b2?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-137%20grün-2f6f4e)
![Status](https://img.shields.io/badge/Status-Portfolio--Demo-b45309)

</div>

> **Demo-Shop.** Fiktive Marke ohne Handelsregistereintrag. Keine echten
> Bestellungen, Zahlungen oder Lieferungen. Alle Preise, Firmenangaben und
> Rechtstexte sind Platzhalter für ein Übungsprojekt.

## Worum es geht

Ein Bekleidungsgroßhändler für Handwerk und Industrie verkauft nicht nur
T-Shirts, sondern Ausrüstung mit Logo. Genau daran scheitern normale Shopwaren:
Der eine Teil ist ein Katalog mit Größen und Farben, der andere ein
Anfragegeschäft mit Angebot, Veredelungsprüfung und Stückpreisen.

Werkfaden bildet beides in einem Shop ab, ohne die beiden Vorgänge zu vermischen:

- **Kauf** — Katalog → Variante → Warenkorb → deutsche Lieferadresse →
  Sandbox-Zahlung → Bestellhistorie.
- **Anfrage** — Logo-Veredelung, Angebot für Teams und Stickerei-Preisrechner
  laufen getrennt vom Kauf. Eine Anfrage ist keine Bestellung und reserviert
  keinen Bestand.

Der Shop ist ein Portfolio-Projekt: echte Handelslogik mit nachvollziehbaren
Sicherheits- und Testnachweisen, aber bewusst ohne echte Zahlungen.

## Screenshots

### Startseite & Kollektion

<table>
  <tr>
    <td><img src="docs/screenshots/storefront-01.webp" alt="Startseite mit Hero, Demo-Hinweis und Navigationsleiste" width="400"/></td>
    <td><img src="docs/screenshots/storefront-02.webp" alt="Kategorien: fünf Kollektionen im Überblick" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/storefront-03.webp" alt="Beliebte Artikel als Produktkarten mit Preisen" width="400"/></td>
    <td><img src="docs/screenshots/storefront-04.webp" alt="In drei Schritten zur Bestellung, Warum-Werkfaden-Abschnitt" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/storefront-06.webp" alt="Footer mit Newsletter-Anmeldung und Rechtstext-Links" width="400"/></td>
    <td><img src="docs/screenshots/storefront-07.webp" alt="Mega-Menü Kollektion mit den Kollektionen" width="400"/></td>
  </tr>
</table>

### Katalog, Suche & Filter

<table>
  <tr>
    <td><img src="docs/screenshots/storefront-12.webp" alt="Artikelliste mit Sortierung" width="400"/></td>
    <td><img src="docs/screenshots/storefront-09.webp" alt="Filterpanel mit Farbe und Größe inklusive Trefferzahlen" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/storefront-11.webp" alt="Such-Overlay mit Produktsuche" width="400"/></td>
    <td><img src="docs/screenshots/storefront-13.webp" alt="Produktdetailseite T-Shirt Heavy Duty" width="400"/></td>
  </tr>
</table>

### Warenkorb & Kasse

<table>
  <tr>
    <td><img src="docs/screenshots/storefront-14.webp" alt="Warenkorb mit Variante, Menge und Zwischensumme" width="400"/></td>
    <td><img src="docs/screenshots/storefront-15.webp" alt="Kasse: Kontakt, Rabattcode und Bestellübersicht" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/storefront-16.webp" alt="Kasse: Lieferadresse mit deutschen Adressfeldern" width="400"/></td>
    <td><img src="docs/screenshots/storefront-10.webp" alt="Anmeldeseite" width="400"/></td>
  </tr>
</table>

### Veredelung, Angebote & Stickerei

<table>
  <tr>
    <td><img src="docs/screenshots/storefront-05.webp" alt="Seite Logo-Veredelung mit Erklärung und Call-to-Action" width="400"/></td>
    <td><img src="docs/screenshots/storefront-08.webp" alt="Leistungen-Menü mit Stickerei, Logo-Veredelung und Angeboten" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/storefront-17.webp" alt="Anfrageformular Logo-Veredelung mit Datei-Upload" width="400"/></td>
    <td><img src="docs/screenshots/storefront-18.webp" alt="Angebot anfragen mit Positionen und Mengen" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/storefront-19.webp" alt="Stickerei-Preisrechner mit Auswahl und Schätzung" width="400"/></td>
    <td></td>
  </tr>
</table>

### Medusa Admin

Die Kundenansicht zeigt ausschließlich Testkonten; die E-Mail-Spalte ist
geschwärzt. Der Admin selbst ist der unveränderte Medusa-Admin.

<table>
  <tr>
    <td><img src="docs/screenshots/admin-01.webp" alt="Medusa-Admin: Anmeldung" width="400"/></td>
    <td><img src="docs/screenshots/admin-02.webp" alt="Medusa-Admin: Bestellübersicht" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/admin-03.webp" alt="Medusa-Admin: Produktliste" width="400"/></td>
    <td><img src="docs/screenshots/admin-04.webp" alt="Medusa-Admin: Bestandsübersicht" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/admin-05.webp" alt="Medusa-Admin: Kundenliste mit geschwärzten E-Mail-Adressen" width="400"/></td>
    <td><img src="docs/screenshots/admin-06.webp" alt="Medusa-Admin: Aktionen mit Demo-Rabattcodes" width="400"/></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/admin-07.webp" alt="Medusa-Admin: Befehlspalette zum Springen" width="400"/></td>
    <td><img src="docs/screenshots/admin-08.webp" alt="Medusa-Admin: Bestelldetail" width="400"/></td>
  </tr>
</table>

## Kernfunktionen

**Katalog & Suche**

- Fünf Kollektionen und Kategorien, 25 Demo-Artikel in XS–4XL.
- Filter nach Größe, Farbe, Preis und Verfügbarkeit; Trefferzahlen pro Filter.
- Sortierung nach Preis, Neuheit und Titel; Suche als Overlay.
- Serverseitig berechneter Variantenpreis und Bestand — nie aus dem Client.

**Warenkorb & Kasse**

- Warenkorb mit Variante, Menge und Zwischensumme; ungültige Mengen und
  ausverkaufte Varianten werden serverseitig abgelehnt.
- Deutsche Lieferadressen, Versand 5,90 € brutto, versandkostenfrei ab 100 €.
- Stripe im Sandbox-Modus; doppelte Callbacks erzeugen keine doppelte Bestellung
  (idempotenter Checkout), fehlgeschlagene Zahlungen erscheinen nicht als bezahlt.
- Rabattcodes (`WERKFADEN10`, `WERKFADEN5`) inklusive abgelaufenem und
  aufgebrauchtem Code für Negativtests.

**Konto & Bestellungen**

- Registrierung, Login, Logout, Bestellhistorie.
- Zugriff nur auf eigene Bestellungen: fremde Bestellung, anonyme Anfrage und
  ungültiges Token erhalten 401, nicht 403 (`ww-007-customer-access.spec.ts`).

**Veredelung, Angebote & Stickerei**

- Anfrage für Logo-Veredelung mit einer Datei: erlaubte Rastertypen,
  Magic-Byte-Prüfung, 5 MiB, Zufallsname, privater Speicher, 5 Anfragen/Minute/IP.
- Angebotsanfrage für Teams mit Positionen und Mengen (`/angebote`), Abruf über
  einen einmaligen Token-Link (nur SHA-256 gespeichert).
- Angebot annehmen erzeugt eine einmalig gültige Aktion — per
  Compare-and-Set, damit zwei Klicks nicht zwei Aktionen erzeugen.
- Stickerei-Preisrechner mit Schätzung; die Schätzung ist eine Orientierung und
  kein Bestellpreis.

**Betrieb & Inhalt**

- Medusa Admin für Produkte, Bestand, Bestellungen, Kunden und Aktionen.
- Lokaler E-Mail-Sink: Bestellbestätigung und Veredelungsbestätigung landen als
  `.eml` auf der Platte, nichts verlässt die Maschine; Fehler werden als
  `FAILURE`-Datensatz sichtbar statt still verschluckt.
- Deutsch-first, dauerhafter Demo-Hinweis, klar beschriftete Rechtstexte mit
  `[…]`-Platzhaltern für echte Betreiberangaben.

## Tests (TDD)

Getestet wird dort, wo Verhalten berechnet wird — nicht überall. Strukturelle
Arbeit (Layout, Menü, Typografie) bekommt keinen erfundenen Test; Preislogik,
Zugriff, Wettläufe und Idempotenz schon. Der Ablauf pro Ticket: erst der
fehlschlagende Test, dann die Implementierung.

```bash
npm run check
```

| Ebene | Umfang | Prüft |
| --- | --- | --- |
| Backend-Unit | 71 Tests | Preis- und Steuerberechnung, Rabattlogik, Token-Erzeugung, Bildvalidierung, Rate-Limit, E-Mail-Sink |
| Storefront-Unit | 34 Tests | Filter- und Sortierlogik, Variantenverfügbarkeit, Rabattcodes |
| HTTP-Integration | 13 Suites, 51 Tests gegen eine isolierte `_test`-Datenbank | Zahlung und Zahlungs-Idempotenz, letzter Bestand im Wettlauf, Kunden- und Admin-Zugriff, Benachrichtigungen, Suche, Rabattcodes, Angebote, Stickerei, Angebotsannahme-Wettlauf |

Zwei Beispiele für Tests, die wirklich etwas beweisen:

- **Angebotsannahme als Wettlauf:** zwei parallele Anfragen dürfen nicht zwei
  Aktionen erzeugen. Der Test erzwingt genau eine erfolgreiche Antwort und
  mindestens eine Ablehnung — er prüft das Ergebnis, nicht die Absicht.
- **Fremde Bestellung:** ein Konto darf die Bestellung eines anderen Kontos nicht
  lesen; fremde ID, anonyme Anfrage und ungültiges Token bekommen dieselbe
  Ablehnung (401).

Kein `passWithNoTests`, keine ignorierten Build-Fehler, keine Mocks statt
Datenbank, wo Bestand und Wettlauf das eigentliche Risiko sind.

## Spezifikation (SDD)

Das Projekt ist spec-getrieben gebaut, nicht feature-für-feature improvisiert.
Jede Änderung beginnt in `docs/sdd/`, nicht im Code:

| Artefakt | Inhalt |
| --- | --- |
| `docs/sdd/tier.md` | Zweck (PORTFOLIO) und Tier (Standard) — legt fest, wie viel Zeremonie gilt |
| `docs/sdd/spec.md` | 14 funktionale Anforderungen (FR), nicht-funktionale Anforderungen (NFR), UX-Akzeptanz, Nicht-Ziele |
| `docs/sdd/contract.md` | Datenmodell, Modulgrenzen, Zod-Verträge, Berechtigungen |
| `docs/sdd/tickets/` | 25 vertikale Tickets WW-000…WW-027, je ein Branch, je ein PR |
| `docs/sdd/security-review.md` | Sicherheitsprüfung für Auth, Uploads und Zahlungen |
| `docs/sdd/state.md` | Übergabe: erledigt, offen, Branch, Umgebung |

Jedes Ticket liefert einen senkrechten Schnitt mit eigenem Prüfszenario und
Evidenz im PR. Zwei Beispiele für Entscheidungen, die dort dokumentiert sind und
den Code geformt haben:

- Die Medusa-API liefert Preise in Euro (`29.9`), nicht in Cent; nur eigene
  Beträge wie der Angebotswert liegen als ganzzahlige Cent in der Datenbank
  (`offered_total_minor`) und werden an der Grenze einmal gerundet.
- Ein Angebot ist ohne Login über einen einmaligen Token erreichbar; der Token
  wird nur als Hash gespeichert und in konstanter Zeit verglichen.

## Tech Stack

| Schicht | Technologie |
| --- | --- |
| Backend | Medusa 2.21 (Node 22), eigene Module für Veredelung und Angebote, Stripe-Provider |
| Storefront | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind 3 |
| Daten | PostgreSQL 16, Redis 7 (Docker Compose, isoliert auf 5544/6384) |
| Validierung | Zod 4 an jeder Grenze |
| Tests | Jest 29 (Unit), Medusa-Integrationstests gegen temporäre Datenbank |
| Werkzeuge | pnpm 10.11.1 Workspace, Turborepo |

## Lokales Setup

Node 22.22.1 (`nvm use`), Docker Compose, pnpm 10.11.1. Wenn pnpm fehlt, überall
`npx --yes pnpm@10.11.1` statt `pnpm` verwenden; kein zweites Lockfile anlegen.

```bash
npx --yes pnpm@10.11.1 install --frozen-lockfile
npm run setup:env
docker compose up -d --wait
npx --yes pnpm@10.11.1 --filter @dtc/backend exec medusa db:migrate --skip-scripts --execute-safe-links --execute-safe-search
npm run setup:demo   # Store, Suche, Katalog, Bestand, Versand/Steuer, Rabattcodes
```

`setup:demo` ist die einzige Einrichtungskette: sie legt den Store (Deutschland/EUR)
mit Publishable Key an, füllt den Suchindex, sät die 25 Demo-Produkte samt
Lagerbeständen, richtet Versand, Steuer und Zahlungsanbieter ein und erzeugt die
Demo-Rabattcodes. Jeder Schritt ist idempotent — ein zweiter Lauf ändert keine
Zahlen und legt nichts doppelt an. Einzelschritte für die Fehlersuche:
`setup:store`, `setup:catalog`, `setup:inventory`, `setup:checkout`,
`setup:promotions`.

Alle Einrichtungsskripte schreiben nur in eine lokale Datenbank, deren Name zu
`DB_NAME` passt (`werkfaden_dev` aus `.env`); sonst brechen sie mit einer
klaren Meldung ab, bevor sie etwas anlegen. Für eine zweite, saubere Datenbank
(z. B. eine Probeinstallation) überschreibt man deshalb beide Werte und
verhindert, dass der Publishable Key der laufenden Storefront ersetzt wird:

```bash
DATABASE_URL=postgres://…:5544/werkfaden_rehearsal DB_NAME=werkfaden_rehearsal \
  SETUP_WRITE_STOREFRONT_KEY=false npm run setup:demo
```

Genau diesen Lauf macht `scripts/rehearse-demo-setup.sh`: Datenbank neu anlegen,
migrieren, die Kette zweimal ausführen und die Zeilenzahlen vergleichen.

Der Env-Generator überschreibt nichts Bestehendes; Secrets bleiben in
ignorierten lokalen Dateien. PostgreSQL lauscht auf `localhost:5544`, Redis auf
`localhost:6384` — beides sind keine Produktionsdienste.

```bash
npm run backend:dev     # API :9000, Admin :9000/app
npm run storefront:dev  # Storefront :8000
```

Für echte Zahlungen im Sandbox-Modus werden Stripe-Testkeys benötigt:
`STRIPE_API_KEY` + `STRIPE_WEBHOOK_SECRET` in `apps/backend/.env`,
`NEXT_PUBLIC_STRIPE_KEY` in `apps/storefront/.env.local`, Webhooks über
`stripe listen`. Ohne Keys läuft der Katalog, aber keine Bezahlung.

Zwei Stolpersteine, die im Projekt codiert sind statt dokumentiert:

- `npm run build:ui` baut die Storefront nur, wenn das Backend auf `:9000`
  antwortet und kein Dev-Server auf `:8000` läuft (beide teilen sich `.next`).
  Sonst bricht der Build mit einer verständlichen Meldung ab.
- `npm run check:ui` prüft nur die Storefront-Oberfläche (Lint, Typen, 34 Tests,
  unter 10 Sekunden) — für UI-Tickets statt des vollen Laufs.

## Demo-Grenzen

Ehrlich benannt, weil es sonst wie ein Werbetext klingt:

- **Keine echten Zahlungen.** Stripe nur im Testmodus, keine Auszahlung, keine
  Rechnung.
- **Kein Versand.** Versandkosten und Lieferzeiten sind Demo-Werte für
  Deutschland.
- **E-Mails werden nicht verschickt**, sondern als Datei abgelegt.
- **Rechtstexte sind Entwürfe** mit Platzhaltern; Impressum, Datenschutz, AGB und
  Widerruf sind nicht anwaltlich geprüft.
- **Marke und Firmenangaben sind erfunden** (Adresse in Kassel). Kein
  Handelsregistereintrag, keine Umsatzsteuer-ID, kein Mandat.
- **Bilder** sind Demo-Assets; Herkunft und Lizenz sind nicht für eine
  Veröffentlichung geprüft.
- **Kein Live-Deployment.** Das Projekt läuft lokal; die Screenshots stammen aus
  der lokalen Instanz.

## Projektstruktur

```text
apps/backend/                 Medusa-API, Admin, eigene Module
  src/modules/personalization/  Veredelungsanfragen, Upload-Prüfung
  src/modules/quote/            Angebote, Token-Zugriff, Annahme
  src/modules/notification-sink/ E-Mail-Sink (Dateien statt Versand)
  integration-tests/http/       HTTP-Tests gegen temporäre Datenbank
apps/storefront/              Next.js-Storefront
  src/app/[countryCode]/        Katalog, Kasse, Konto, Rechtstexte
  src/modules/                  Layout, Warenkorb, Kasse, Produkt
  src/lib/                      Filter, Preise, Rabattcodes, API-Client
docs/sdd/                     Spec, Vertrag, Tickets, Sicherheitsprüfung
docs/screenshots/             Bilder für dieses README
scripts/                      Setup- und Build-Helfer
compose.yaml                  lokale PostgreSQL- und Redis-Instanz
```

## Lizenz und Herkunft

Basiert auf dem MIT-lizenzierten Medusa-[DTC-Starter](https://github.com/medusajs/dtc-starter),
Commit `15ef93da7d155ad990d8cc6db0296446fecbdfe6`. Lizenz und Attribution bleiben
erhalten. Paketversionen und Konventionen stammen aus diesem Upstream-Snapshot;
das Projekt erhebt keinen Anspruch auf eine eigenständige E-Commerce-Engine.
