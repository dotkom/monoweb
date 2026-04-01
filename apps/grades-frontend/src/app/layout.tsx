import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { cn } from "@dotkomonline/ui"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import { NextIntlClientProvider } from "next-intl"
import PlausibleProvider from "next-plausible"
import { ThemeProvider } from "next-themes"
import { Figtree, Inter } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../globals.css"
import { Navbar } from "./components/navbar/Navbar"
import { Footer } from "./components/Footer"

setDateFnsDefaultOptions({ locale: nb })

const fontBody = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" })
const fontTitle = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-title" })

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning>
      <body className={cn(fontTitle.variable, fontBody.variable, "dark:bg-[#141821] bg-white")}>
        <PlausibleProvider domain="grades.no">
          <QueryProvider>
            <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme">
              <NextIntlClientProvider>
                <div className="flex flex-col gap-8">
                  <Navbar />
                  <div className="min-h-screen flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4 lg:px-12">
                    <main className="grow">{children}</main>
                    <Footer />
                  </div>
                </div>
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
