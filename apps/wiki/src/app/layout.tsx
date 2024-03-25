import { type Metadata } from "next"
import { type PropsWithChildren } from "react"
import "@dotkomonline/config/tailwind.css"
import "../root.css"

export const metadata: Metadata = {
  title: "Wiki",
  description: "Wiki for Online NTNU",
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
