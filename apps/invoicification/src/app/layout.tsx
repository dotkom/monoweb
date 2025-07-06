import { cn } from "@dotkomonline/ui"
import type { Metadata } from "next"
import { Figtree, Inter } from "next/font/google"
import type { PropsWithChildren } from "react"
import { QueryProvider } from "./query-provider"
import "../root.css"

export const metadata: Metadata = {
  title: "Online Fakturaskjema for Bedrifter",
  description: "Dette skjemaet skal brukes til å rapportere fakturainformasjon til Online.",
}

const fontBody = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" })
const fontTitle = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-title" })

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={cn(fontBody.variable, fontTitle.variable)}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
