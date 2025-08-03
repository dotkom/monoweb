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

setDateFnsDefaultOptions({ locale: nb })

export const metadata: Metadata = {
  title: "Onlineweb 5",
  description: "Linjeforeningen Onlines nettsider",
  icons: {
    icon: [
      {
        url: "/online-logo-o.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/online-logo-o-darkmode.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: [
      {
        url: "/online-logo-o.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/online-logo-o-darkmode.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/online-logo-o.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/online-logo-o-darkmode.svg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
}

const fontBody = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" })
const fontTitle = Figtree({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-title" })

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning>
      <body className={cn(fontTitle.variable, fontBody.variable, "bg-white dark:bg-stone-950")}>
        <SessionProvider session={session}>
          <QueryProvider>
            <ThemeProvider defaultTheme="light" enableSystem={false} attribute="data-theme">
              <div className="min-h-screen flex flex-col gap-8 w-full max-w-screen-xl mx-auto px-4 lg:px-12">
                <Navbar />
                <main className="grow">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
