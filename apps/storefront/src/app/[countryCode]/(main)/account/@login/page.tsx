import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Anmelden",
  description: "Melden Sie sich bei Ihrem Werkfaden-Konto an.",
}

export default function Login() {
  return <LoginTemplate />
}
