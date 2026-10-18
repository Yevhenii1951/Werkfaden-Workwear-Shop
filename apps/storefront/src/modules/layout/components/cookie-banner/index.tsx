"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const CONSENT_KEY = "wf-cookie-consent"

const CookieBanner = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(!localStorage.getItem(CONSENT_KEY))
  }, [])

  if (!visible) {
    return null
  }

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "1")
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie-Hinweis"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-[60] max-w-md border border-wf-line bg-wf-surface p-5 shadow-wf md:inset-x-auto md:bottom-6 md:left-6"
    >
      <p className="text-sm leading-6 text-wf-ink-soft">
        Diese Demo verwendet ausschließlich technisch notwendige Cookies für
        Warenkorb und Anmeldung. Es werden keine Analyse- oder
        Marketing-Cookies gesetzt.{" "}
        <LocalizedClientLink
          href="/datenschutz"
          className="underline transition-colors hover:text-wf-ink"
        >
          Datenschutz
        </LocalizedClientLink>
      </p>
      <button
        type="button"
        onClick={accept}
        className="wf-btn-primary mt-4 w-full sm:w-auto"
      >
        Verstanden
      </button>
    </div>
  )
}

export default CookieBanner
