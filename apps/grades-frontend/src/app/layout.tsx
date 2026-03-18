import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { ThemeProvider } from "next-themes"
import type { PropsWithChildren } from "react"
import "../globals.css"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import PlausibleProvider from "next-plausible"
import { Figtree, Inter } from "next/font/google"
import { cn } from "@dotkomonline/ui"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

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
              <div className="min-h-screen flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4 lg:px-12">
                <Navbar />
                <main className="grow">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
