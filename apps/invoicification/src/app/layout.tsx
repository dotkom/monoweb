import "@dotkomonline/config/tailwind.css"
import type { Metadata } from "next"
import type { PropsWithChildren } from "react"
import "../root.css"
import { cn } from "@dotkomonline/ui"
import { Fraunces, Poppins } from "next/font/google"
import { QueryProvider } from "./query-provider"

export const metadata: Metadata = {
  title: "Online Fakturaskjema for Bedrifter",
  description: "Dette skjemaet skal brukes til å rapportere fakturainformasjon til Online.",
}

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" })
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fraunces" })

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={cn(poppins.variable, fraunces.variable)}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
