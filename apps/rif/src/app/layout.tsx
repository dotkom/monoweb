import { type Metadata } from "next"
import { type PropsWithChildren } from "react"
import "@dotkomonline/config/tailwind.css"
import "../root.css"
import { QueryProvider } from "./query-provider"

export const metadata: Metadata = {
  title: "Online Interesseskjema for Bedrifter",
  description: "Dette skjemaet skal brukes til å melde interesse for samarbeid med Online.",
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
