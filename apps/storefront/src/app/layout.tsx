import { getBaseURL } from "@lib/util/env"
import DemoNotice from "@modules/layout/components/demo-notice"
import { Metadata } from "next"
import {
  Bricolage_Grotesque,
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

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-bricolage",
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
      className={`${instrumentSans.variable} ${bricolageGrotesque.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <DemoNotice />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
