import {
  DEMO_MAIL_NOTE,
  formatMoney,
  orderConfirmationEmail,
  personalizationAcknowledgmentEmail,
} from "../notification-emails"

describe("formatMoney", () => {
  it("formats euro amounts for the German locale", () => {
    const formatted = formatMoney(119.7, "EUR")
    expect(formatted).toContain("119,70")
    expect(formatted).toContain("€")
  })

  it("treats missing and non-numeric amounts as zero", () => {
    expect(formatMoney(null, "EUR")).toContain("0,00")
    expect(formatMoney("abc", "EUR")).toContain("0,00")
  })
})

describe("orderConfirmationEmail", () => {
  const content = orderConfirmationEmail({
    displayId: 1024,
    items: [{ title: "Arbeitshose", quantity: 2, total: "119,80 €" }],
    shipping: "5,90 €",
    total: "125,70 €",
  })

  it("includes the order number, items, totals and demo note", () => {
    expect(content.subject).toContain("1024")
    expect(content.text).toContain("2× Arbeitshose")
    expect(content.text).toContain("125,70 €")
    expect(content.text).toContain(DEMO_MAIL_NOTE)
    expect(content.html).toContain("1024")
  })

  it("escapes HTML in item titles", () => {
    const escaped = orderConfirmationEmail({
      displayId: 1,
      items: [
        { title: "<img src=x onerror=alert(1)>", quantity: 1, total: "1,00 €" },
      ],
      shipping: "0,00 €",
      total: "1,00 €",
    })

    expect(escaped.html).not.toContain("<img")
    expect(escaped.html).toContain("&lt;img")
  })
})

describe("personalizationAcknowledgmentEmail", () => {
  const content = personalizationAcknowledgmentEmail({
    requestId: "pzr_123",
    contactName: "Erika Musterfrau",
    productTitle: "Softshelljacke",
    quantity: 10,
  })

  it("states it is not an order and reserves no stock", () => {
    expect(content.text).toContain("Guten Tag Erika Musterfrau")
    expect(content.text).toContain("pzr_123")
    expect(content.text).toContain("keine Bestellung")
    expect(content.text).toContain("keinen Lagerbestand")
  })

  it("escapes HTML in the contact name", () => {
    const escaped = personalizationAcknowledgmentEmail({
      requestId: "pzr_1",
      contactName: "<b>x</b>",
      productTitle: "Jacke",
      quantity: 1,
    })

    expect(escaped.html).not.toContain("<b>")
    expect(escaped.html).toContain("&lt;b&gt;")
  })
})
