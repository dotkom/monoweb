import { cn } from "@dotkomonline/ui"
import type { Metadata } from "next"
import { Fraunces, Poppins } from "next/font/google"
import type { PropsWithChildren } from "react"
import { QueryProvider } from "./query-provider"
import "../root.css"

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
