"use client"

import { useActionState } from "react"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { acceptQuoteRequest, type QuoteAcceptState } from "@lib/data/quotes"

type Props = {
  id: string
  token?: string
}

const QuoteAccept = ({ id, token }: Props) => {
  const [state, formAction] = useActionState<QuoteAcceptState, FormData>(
    acceptQuoteRequest,
    null
  )

  if (state?.state === "success") {
    return (
      <div
        className="flex flex-col gap-y-3 border border-ui-border-base rounded-rounded p-5"
        data-testid="quote-accepted"
      >
        <p className="text-small-regular">
          Ihr Angebot ist angenommen. Ihr persönlicher Rabattcode:
        </p>
        <code
          className="text-lg font-semibold tracking-wider"
          data-testid="quote-promotion-code"
        >
          {state.code}
        </code>
        <p className="text-small-regular text-ui-fg-subtle">
          Der Code gilt einmalig und ist eine Woche gültig. Legen Sie die
          Artikel in den Warenkorb und geben Sie den Code an der Kasse ein.
        </p>
        <p className="text-small-regular text-ui-fg-subtle">
          Demo: Es wurde kein Auftrag erstellt.
        </p>
        <LocalizedClientLink href="/cart" className="underline w-fit">
          Zum Warenkorb
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-y-3" data-testid="quote-accept-form">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="token" value={token ?? ""} />
      {state?.state === "error" && <ErrorMessage error={state.error} />}
      <SubmitButton className="w-fit" data-testid="quote-accept-button">
        Angebot annehmen
      </SubmitButton>
    </form>
  )
}

export default QuoteAccept
