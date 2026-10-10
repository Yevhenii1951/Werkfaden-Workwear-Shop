import { getBaseURL } from "@lib/util/env"
import DemoNotice from "@modules/layout/components/demo-notice"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="de" data-mode="light">
      <body>
        <DemoNotice />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
