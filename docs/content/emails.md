# E-Mail-Vorlagen (Werkfaden)

## 1. Bestellbestätigung

**subject_de:** Ihre Bestellbestätigung – Werkfaden #{orderNumber}
**preview_de:** Vielen Dank für Ihre Bestellung. Hier sind die Details.
**body_de:**
Sehr geehrte(r) {customerName},

vielen Dank für Ihre Bestellung bei Werkfaden. Wir haben Ihre Bestellung #{orderNumber} erhalten und bereiten sie vor.

Bestellsumme: {totalPrice}
Zahlungsart: Stripe (Testmodus)

Hinweis: Dies ist eine simulierte Bestellbestätigung aus einem Demo-Shop. Es wurde keine echte Zahlung vorgenommen.

Mit freundlichen Grüßen,
Ihr Werkfaden-Team

## 2. Zahlung fehlgeschlagen

**subject_de:** Problem mit Ihrer Zahlung – Bestellung #{orderNumber}
**preview_de:** Wir konnten Ihre Zahlung nicht verarbeiten. Bitte versuchen Sie es erneut.
**body_de:**
Sehr geehrte(r) {customerName},

leider konnten wir die Zahlung für Ihre Bestellung #{orderNumber} nicht erfolgreich verarbeiten. Ihre Bestellung ist daher noch nicht abgeschlossen.

Bitte überprüfen Sie Ihre Zahlungsdaten oder wählen Sie eine andere Zahlungsmethode in Ihrem Kundenkonto.

Mit freundlichen Grüßen,
Ihr Werkfaden-Team

## 3. Versandbestätigung

**subject_de:** Ihre Bestellung #{orderNumber} wurde versendet
**preview_de:** Ihre Artikel sind auf dem Weg zu Ihnen.
**body_de:**
Sehr geehrte(r) {customerName},

gute Nachrichten! Ihre Bestellung #{orderNumber} wurde soeben an den Versanddienstleister übergeben.

Simulierter Tracking-Link: [LINK_PLACEHOLDER]

Bitte beachten Sie: Dies ist eine Demo-Benachrichtigung.

Mit freundlichen Grüßen,
Ihr Werkfaden-Team

## 4. Stornierung der Bestellung

**subject_de:** Stornierung Ihrer Bestellung #{orderNumber}
**preview_de:** Ihre Bestellung wurde wie gewünscht storniert.
**body_de:**
Sehr geehrte(r) {customerName},

wir bestätigen hiermit die Stornierung Ihrer Bestellung #{orderNumber} vom {orderDate}.

Falls bereits eine Testzahlung simuliert wurde, wird diese automatisch rückgängig gemacht.

Mit freundlichen Grüßen,
Ihr Werkfaden-Team

## 5. Erstattung

**subject_de:** Erstattung für Ihre Bestellung #{orderNumber}
**preview_de:** Wir haben die Rückerstattung für Ihre Bestellung eingeleitet.
**body_de:**
Sehr geehrte(r) {customerName},

wir haben die Rückerstattung in Höhe von {refundAmount} für Ihre Bestellung #{orderNumber} veranlasst. Der Betrag sollte innerhalb der nächsten Werktage auf Ihrem ursprünglichen Zahlungsweg erscheinen.

Mit freundlichen Grüßen,
Ihr Werkfaden-Team

## 6. Eingang der Veredelungsanfrage (Kunde)

**subject_de:** Wir haben Ihre Veredelungsanfrage erhalten
**preview_de:** Vielen Dank für Ihre Anfrage. Wir prüfen sie derzeit.
**body_de:**
Sehr geehrte(r) {customerName},

vielen Dank für Ihre Veredelungsanfrage für den Artikel {productName}. Wir haben Ihre Datei und Ihre Mengenangabe erhalten.

Unser Team prüft nun die Machbarkeit und die genauen Kosten. Sie erhalten in Kürze ein individuelles Angebot von uns. Diese Anfrage ist noch kein Kaufvertrag und reserviert keine Warenbestände.

Mit freundlichen Grüßen,
Ihr Werkfaden-Team

## 7. Benachrichtigung an Administrator (Neue Anfrage)

**subject_de:** NEUE Veredelungsanfrage: {productName} von {customerName}
**preview_de:** Eine neue Anfrage zur Logo-Veredelung muss geprüft werden.
**body_de:**
Hallo Admin,

eine neue Veredelungsanfrage ist eingegangen:

- Kunde: {customerName} ({customerEmail})
- Firma: {companyName}
- Artikel: {productName}
- Menge: {quantity}
- Kommentar: {comment}
- Datei: [LINK_ZUR_DATEI_PLACEHOLDER]

Bitte prüfen Sie die Machbarkeit und erstellen Sie ein Angebot.

## 8. Manuelles Angebot für Veredelungsanfrage

**subject_de:** Ihr Angebot für die Veredelung von {productName}
**preview_de:** Wir haben Ihre Anfrage geprüft. Hier ist Ihr individuelles Angebot.
**body_de:**
Sehr geehrte(r) {customerName},

vielen Dank für Ihre Geduld. Wir haben Ihre Veredelungsanfrage für {productName} geprüft.

Angebot:

- Veredelungsart: {customizationType}
- Preis pro Stück: {pricePerUnit}
- Gesamtpreis: {totalPrice}
- Geschätzte Produktionsdauer: {estimatedDays} Werktage nach Auftragsbestätigung

Wenn Sie mit diesem Angebot einverstanden sind, antworten Sie bitte direkt auf diese E-Mail. Wir senden Ihnen dann einen Link zur sicheren Bezahlung und Auftragsbestätigung zu.

Mit freundlichen Grüßen,
Ihr Werkfaden-Team
