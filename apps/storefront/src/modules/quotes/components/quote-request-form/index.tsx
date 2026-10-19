"use client"

import { useActionState, useState } from "react"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import {
  submitQuoteRequest,
  type QuoteLineInput,
  type QuoteRequestState,
} from "@lib/data/quotes"

export type QuoteProductOption = {
  id: string
  title: string
  variants: { id: string; title: string }[]
}

export type QuoteFormItem = QuoteLineInput & { title: string }

type Props = {
  countryCode: string
  products: QuoteProductOption[]
  initialItems: QuoteFormItem[]
  initialComment?: string
}

const fieldClass =
  "block w-full h-11 px-4 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover"

const QuoteRequestForm = ({
  countryCode,
  products,
  initialItems,
  initialComment,
}: Props) => {
  const [items, setItems] = useState<QuoteFormItem[]>(initialItems)
  const [selection, setSelection] = useState("")
  const [message, formAction] = useActionState<QuoteRequestState, FormData>(
    submitQuoteRequest,
    null
  )

  const addItem = () => {
    if (!selection) {
      return
    }
    const [productId, variantId] = selection.split("|")
    const product = products.find((entry) => entry.id === productId)
    const variant = product?.variants.find((entry) => entry.id === variantId)

    if (!product || !variant) {
      return
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.variant_id === variantId)
      if (existing) {
        return prev.map((item) =>
          item.variant_id === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          product_id: productId,
          variant_id: variantId,
          title: `${product.title} – ${variant.title}`,
          quantity: 1,
        },
      ]
    })
    setSelection("")
  }

  const setQuantity = (variantId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.variant_id === variantId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variant_id !== variantId))
  }

  return (
    <form
      action={formAction}
      className="max-w-2xl flex flex-col gap-y-6"
      data-testid="quote-request-form"
    >
      <input type="hidden" name="countryCode" value={countryCode} />
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map(({ product_id, variant_id, quantity }) => ({
            product_id,
            variant_id,
            quantity,
          }))
        )}
      />

      <div className="flex flex-col gap-y-3">
        <h2 className="txt-compact-large-plus">Positionen</h2>
        {items.length === 0 ? (
          <p className="text-small-regular text-ui-fg-subtle">
            Ihr Warenkorb ist leer. Fügen Sie unten Artikel hinzu.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-ui-border-base border border-ui-border-base rounded-rounded">
            {items.map((item) => (
              <li
                key={item.variant_id}
                className="flex items-center gap-x-4 p-3"
                data-testid="quote-line-item"
              >
                <span className="grow text-small-regular">{item.title}</span>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  aria-label={`Menge für ${item.title}`}
                  onChange={(event) =>
                    setQuantity(item.variant_id, Number(event.target.value))
                  }
                  className="w-20 h-9 px-2 bg-ui-bg-field border rounded-md border-ui-border-base"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.variant_id)}
                  className="text-small-regular text-ui-fg-subtle underline"
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-y-2 sm:flex-row sm:items-end sm:gap-x-3">
          <div className="grow">
            <label className="txt-compact-medium-plus" htmlFor="quote-product">
              Artikel hinzufügen
            </label>
            <select
              id="quote-product"
              value={selection}
              onChange={(event) => setSelection(event.target.value)}
              className={fieldClass}
              data-testid="quote-product-select"
            >
              <option value="">Bitte wählen</option>
              {products.map((product) => (
                <optgroup key={product.id} label={product.title}>
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={`${product.id}|${variant.id}`}>
                      {variant.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="h-11 px-5 border border-ui-border-base rounded-md text-small-regular hover:bg-ui-bg-field-hover"
          >
            Hinzufügen
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <Input
          label="Name"
          name="contact_name"
          required
          autoComplete="name"
          data-testid="quote-name-input"
        />
        <Input
          label="E-Mail"
          name="contact_email"
          type="email"
          required
          autoComplete="email"
          data-testid="quote-email-input"
        />
        <Input
          label="Firma (optional)"
          name="company"
          autoComplete="organization"
          data-testid="quote-company-input"
        />
        <div className="flex flex-col gap-y-2">
          <label className="txt-compact-medium-plus" htmlFor="comment">
            Nachricht (optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            maxLength={1000}
            defaultValue={initialComment}
            className="block w-full p-3 bg-ui-bg-field border rounded-md border-ui-border-base focus:outline-none"
            data-testid="quote-comment-input"
          />
        </div>
      </div>

      {message?.state === "error" && <ErrorMessage error={message.error} />}

      <SubmitButton className="w-fit" data-testid="quote-submit-button">
        Angebot anfordern
      </SubmitButton>
    </form>
  )
}

export default QuoteRequestForm
