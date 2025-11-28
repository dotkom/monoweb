import { auth } from "@/auth"
import { Footer } from "@/components/Footer/Footer"
import { Navbar } from "@/components/Navbar/Navbar"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import { cn } from "@dotkomonline/ui"
import { ThemeProvider } from "next-themes"
import { Figtree, Inter } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../globals.css"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import type { Metadata } from "next"
import PlausibleProvider from "next-plausible"

setDateFnsDefaultOptions({ locale: nb })

export const metadata: Metadata = {
  title: "Linjeforeningen Online",
  description: "Online er linjeforeningen for informatikkstudenter ved NTNU i Trondheim.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

const fontBody = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" })
const fontTitle = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-title" })

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning>
      <body className={cn(fontTitle.variable, fontBody.variable, "bg-white dark:bg-stone-900")}>
        <PlausibleProvider domain="online.ntnu.no">
          <SessionProvider session={session}>
            <QueryProvider>
              <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme">
                <div className="min-h-screen flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4 lg:px-12">
                  <Navbar />
                  <main className="grow">{children}</main>
                  <Footer />
                </div>
              </ThemeProvider>
            </QueryProvider>
          </SessionProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
