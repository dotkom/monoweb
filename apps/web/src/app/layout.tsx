import MainLayout from "@/components/layout/MainLayout"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import "@dotkomonline/config/tailwind.css"
import { cn } from "@dotkomonline/ui"
import { Fraunces, Poppins } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../styles/globals.css"
import { Providers } from "./providers"

export const metadata = {
  title: "Onlineweb 5",
  description: "Linjeforeningen Onlines nettsider",
}

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" })
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fraunces" })

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={cn(fraunces.variable, poppins.variable, "h-full w-full")}>
        <QueryProvider>
          <Providers>
            <MainLayout>{children}</MainLayout>
           </Providers>
        </QueryProvider>
      </body>
    </html>
  )
}
