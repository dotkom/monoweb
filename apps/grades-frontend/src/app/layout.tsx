import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { ThemeProvider } from "next-themes"
import type { PropsWithChildren } from "react"
import "../globals.css"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import PlausibleProvider from "next-plausible"
import {Navbar} from "./Navbar"
import {Footer} from "./Footer"

setDateFnsDefaultOptions({ locale: nb })






export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning>
      <body className = "dark:bg-[#141821] bg-pink-400">
        <PlausibleProvider domain="grades.no">
          <QueryProvider>
            <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme">
              <div className="min-h-screen flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4 lg:px-12">
                 <Navbar />
                <main className="grow">{children}</main>
                <Footer/>
              </div>
            </ThemeProvider>
          </QueryProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
