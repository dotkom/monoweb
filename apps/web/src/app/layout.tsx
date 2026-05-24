import { auth0 } from "@/auth"
import { getServerAccessToken } from "@/lib/server-access-token"
import { Footer } from "@/components/Footer/Footer"
import { Navbar } from "@/components/Navbar/Navbar"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { Auth0Provider } from "@auth0/nextjs-auth0/client"
import { cn } from "@dotkomonline/ui"
import { ThemeProvider } from "next-themes"
import { Figtree, Inter, Google_Sans_Code } from "next/font/google"
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
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
}

const fontBody = Inter({ subsets: ["latin"], variable: "--font-body" })
const fontTitle = Figtree({ subsets: ["latin"], variable: "--font-title" })
const fontMono = Google_Sans_Code({ subsets: ["latin"], variable: "--font-mono", fallback: ["monospace"] })

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth0.getSession()
  const accessToken = await getServerAccessToken()
  // Hide the Auth0 user from the client when no usable token exists, so a stale cookie is not treated as logged-in.
  const auth0User = accessToken !== null && session?.user !== undefined ? session.user : undefined

  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning>
      <body
        className={cn(
          fontTitle.variable,
          fontBody.variable,
          fontMono.variable,
          "scrollbar-gutter-both bg-white dark:bg-stone-900"
        )}
      >
        <PlausibleProvider domain="online.ntnu.no">
          <Auth0Provider user={auth0User}>
            <QueryProvider>
              <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme">
                <div className="page-shell">
                  <Navbar />
                  <main className="grow">{children}</main>
                  <Footer />
                </div>
              </ThemeProvider>
            </QueryProvider>
          </Auth0Provider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
