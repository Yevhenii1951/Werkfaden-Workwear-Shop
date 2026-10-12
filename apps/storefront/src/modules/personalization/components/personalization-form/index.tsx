"use client"

import { useActionState } from "react"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  submitPersonalizationRequest,
  type PersonalizationState,
} from "@lib/data/personalization"

export type PersonalizationProduct = {
  id: string
  title: string
  variants: { id: string; title: string }[]
}

type Props = {
  products: PersonalizationProduct[]
}

const fieldClass =
  "block w-full h-11 px-4 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover"

const PersonalizationForm = ({ products }: Props) => {
  const [message, formAction] = useActionState<
    PersonalizationState,
    FormData
  >(submitPersonalizationRequest, null)

  if (message?.state === "success") {
    return (
      <div
        className="max-w-xl border border-ui-border-base rounded-rounded p-6"
        data-testid="personalization-success"
      >
        <h2 className="text-large-semi mb-2">Anfrage eingegangen</h2>
        <p className="text-ui-fg-subtle mb-4">
          Vielen Dank. Ihre Logo-Anfrage wurde an uns übermittelt. Wir prüfen
          sie und melden uns mit einem Angebot.
        </p>
        <p className="text-small-regular text-ui-fg-muted mb-6">
          Referenz: <span className="font-semibold">{message.id}</span>
        </p>
        <p className="text-small-regular text-ui-fg-subtle mb-6">
          Dies ist eine Demo — es wurde kein Auftrag erstellt und keine
          Bestellung ausgelöst.
        </p>
        <LocalizedClientLink href="/store" className="underline">
          Weiter stöbern
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="max-w-xl flex flex-col gap-y-4"
      data-testid="personalization-form"
    >
      <div className="flex flex-col gap-y-2">
        <label className="txt-compact-medium-plus" htmlFor="variant">
          Produkt
        </label>
        <select
          id="variant"
          name="variant"
          required
          defaultValue=""
          className={fieldClass}
          data-testid="personalization-product-select"
        >
          <option value="" disabled>
            Bitte wählen
          </option>
          {products.map((product) => (
            <optgroup key={product.id} label={product.title}>
              {product.variants.map((variant) => (
                <option
                  key={variant.id}
                  value={`${product.id}|${variant.id}`}
                >
                  {variant.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <Input
        label="Menge"
        name="quantity"
        type="number"
        min={1}
        defaultValue={1}
        required
        data-testid="personalization-quantity-input"
      />
      <Input
        label="Name"
        name="contact_name"
        required
        autoComplete="name"
        data-testid="personalization-name-input"
      />
      <Input
        label="E-Mail"
        name="contact_email"
        type="email"
        required
        autoComplete="email"
        data-testid="personalization-email-input"
      />
      <Input
        label="Firma (optional)"
        name="company"
        autoComplete="organization"
        data-testid="personalization-company-input"
      />

      <div className="flex flex-col gap-y-2">
        <label className="txt-compact-medium-plus" htmlFor="comment">
          Anmerkung (optional)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          maxLength={1000}
          className="block w-full px-4 py-3 bg-ui-bg-field border rounded-md focus:outline-none focus:ring-0 border-ui-border-base hover:bg-ui-bg-field-hover"
          data-testid="personalization-comment-input"
        />
      </div>

      <div className="flex flex-col gap-y-2">
        <label className="txt-compact-medium-plus" htmlFor="logo">
          Logo (PNG, JPEG oder WebP, max. 5 MiB)
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          required
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-small-regular"
          data-testid="personalization-logo-input"
        />
      </div>

      <ErrorMessage
        error={message?.state === "error" ? message.error : null}
        data-testid="personalization-error"
      />

      <label className="flex items-start gap-x-2 text-small-regular text-ui-fg-subtle">
        <input
          type="checkbox"
          name="rights_confirmed"
          required
          className="mt-1"
          data-testid="personalization-rights-input"
        />
        <span>
          Ich bestätige, dass ich die Rechte an dem hochgeladenen Logo besitze
          und es für die Veredelung verwendet werden darf.
        </span>
      </label>

      <SubmitButton data-testid="personalization-submit">
        Anfrage senden
      </SubmitButton>
    </form>
  )
}

export default PersonalizationForm
