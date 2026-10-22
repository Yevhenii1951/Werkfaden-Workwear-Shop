/**
 * The three B2B services of this demo shop. The navigation dropdown, the
 * mobile side menu and the footer all point at them, so label, target and
 * wording live in one place.
 */
export const SERVICE_LINKS = [
  {
    id: "logo-veredelung",
    label: "Logo-Veredelung",
    href: "/personalization",
    description:
      "Ihr Logo auf Arbeitskleidung: Datei hochladen und ein Angebot für Druck oder Stickerei anfragen.",
    hint: "Die Anfrage ist unverbindlich und löst keine Bestellung aus.",
    testid: "menu-personalization-link",
  },
  {
    id: "angebote",
    label: "Angebote",
    href: "/angebote",
    description:
      "Mengenangebote für Firmen und Teams anfragen und mit einem einmaligen Code an der Kasse einlösen.",
    hint: "Ein angenommenes Angebot wird zu einem einmaligen Rabattcode, den Sie an der Kasse eingeben.",
    testid: "menu-quotes-link",
  },
  {
    id: "stickerei",
    label: "Stickerei",
    href: "/stickerei",
    description:
      "Preis für eine Stickerei schätzen lassen: Kleidungsstück, Position, Stickgröße und Menge wählen.",
    hint: "Nur eine Schätzung – der Endpreis wird im individuellen Angebot bestätigt.",
    testid: "menu-embroidery-link",
  },
] as const
