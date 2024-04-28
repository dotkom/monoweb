import "@dotkomonline/config/tailwind.css"
import type { Metadata } from "next"
import type { PropsWithChildren } from "react"
import "../root.css"
import { QueryProvider } from "./query-provider"

export const metadata: Metadata = {
  title: "Online Fakturaskjema for Bedrifter",
  description: "Dette skjemaet skal brukes til å rapportere fakturainformasjon til Online.",
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
