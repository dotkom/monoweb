import { auth } from "@/auth"
import { Footer } from "@/components/Footer/Footer"
import { Navbar } from "@/components/Navbar/Navbar"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import { cn } from "@dotkomonline/ui"
import { ThemeProvider } from "next-themes"
import { Fraunces, Poppins } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../globals.css"
import "@mdxeditor/editor/style.css"
import type { Metadata } from "next"

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

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" })
const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-fraunces" })

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fraunces.variable, poppins.variable, "bg-white dark:bg-[#282828] transition-colors duration-1000")}>
        <SessionProvider session={session}>
          <QueryProvider>
            <ThemeProvider defaultTheme="light" enableSystem={false} attribute="data-theme">
              <div className="min-h-screen flex flex-col gap-8 mx-auto w-full max-w-screen-xl">
                <Navbar />
                <main className="flex-grow px-4 lg:px-12">
                  <div className="">{children}</div>
                </main>
                <Footer />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
