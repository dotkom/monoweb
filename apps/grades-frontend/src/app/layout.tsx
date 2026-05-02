import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { cn } from "@dotkomonline/ui"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import { NextIntlClientProvider } from "next-intl"
import PlausibleProvider from "next-plausible"
import { ThemeProvider } from "next-themes"
import { Figtree, Inter } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next"
import type { PropsWithChildren } from "react"
import "../globals.css"
import { Footer } from "./components/Footer"
import { Navbar } from "./components/navbar/Navbar"
import type { Metadata } from "next"

setDateFnsDefaultOptions({ locale: nb })

export const metadata: Metadata = {
  title: "Grades.no - Karakterstatistikk",
  description: "Karakterstatistikk for emner ved Norges teknisk-naturvitenskapelige universitet (NTNU).",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

const fontBody = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" })
const fontTitle = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-title" })

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning>
      <body className={cn(fontTitle.variable, fontBody.variable, "bg-white dark:bg-stone-900")}>
        <PlausibleProvider domain="grades.no">
          <QueryProvider>
            <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme">
              <NextIntlClientProvider>
                <NuqsAdapter>
                  <div className="flex flex-col gap-8">
                    <Navbar />
                    <div className="min-h-screen flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 lg:px-12">
                      <main className="grow">{children}</main>
                      <Footer />
                    </div>
                  </div>
                </NuqsAdapter>
              </NextIntlClientProvider>
            </ThemeProvider>
          </QueryProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
