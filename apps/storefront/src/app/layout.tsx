import { getBaseURL } from "@lib/util/env"
import CookieBanner from "@modules/layout/components/cookie-banner"
import DemoNotice from "@modules/layout/components/demo-notice"
import { Metadata } from "next"
import {
  Barlow_Condensed,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google"
import "styles/globals.css"

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
})

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      data-mode="light"
      className={`${instrumentSans.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <DemoNotice />
        <main className="relative">{props.children}</main>
        <CookieBanner />
      </body>
    </html>
  )
}
