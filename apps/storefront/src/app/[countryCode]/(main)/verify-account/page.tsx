import { Metadata } from "next"
import { Suspense } from "react"

import VerifyAccount from "@modules/account/components/verify-account"

export const metadata: Metadata = {
  title: "E-Mail bestätigen | Werkfaden",
  description: "Bestätigen Sie Ihre E-Mail-Adresse, um die Registrierung abzuschließen.",
}

export default function VerifyAccountPage() {
  return (
    <div className="w-full flex justify-center px-8 py-12">
      <Suspense
        fallback={
          <p className="text-base-regular text-ui-fg-base">
            E-Mail wird bestätigt...
          </p>
        }
      >
        <VerifyAccount />
      </Suspense>
    </div>
  )
}
