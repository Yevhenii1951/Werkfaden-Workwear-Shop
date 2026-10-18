"use client"

import { useState } from "react"

const FooterNewsletter = () => {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState("")

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        setSent(true)
      }}
      className="flex flex-col gap-3 xsmall:flex-row xsmall:items-start"
    >
      <label htmlFor="newsletter-email" className="sr-only">
        E-Mail-Adresse
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        autoComplete="email"
        placeholder="ihre@email.de"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="w-full border border-wf-bone/30 bg-transparent px-4 py-4 text-sm text-wf-bone placeholder:text-wf-bone-dark/50 focus:border-wf-bone focus:outline-none"
      />
      <button
        type="submit"
        className="wf-btn shrink-0 bg-wf-bone text-wf-ink hover:bg-wf-bone-dark"
      >
        Anmelden
      </button>
      {sent && (
        <p
          role="status"
          className="basis-full text-xs leading-5 text-wf-bone-dark/80 xsmall:basis-auto xsmall:pt-4"
        >
          Demo: Ihre E-Mail wird nicht gespeichert oder versendet.
        </p>
      )}
    </form>
  )
}

export default FooterNewsletter
