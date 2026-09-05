import { Footer } from "@/components/Footer/Footer"
import { Navbar } from "@/components/Navbar/Navbar"
import { getAuthenticatedUser } from "@/utils/get-authenticated-user"
import { QueryProvider } from "@/utils/trpc/QueryProvider"
import { Auth0Provider } from "@auth0/nextjs-auth0/client"
import { cn } from "@dotkomonline/ui"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import type { Metadata } from "next"
import PlausibleProvider from "next-plausible"
import { ThemeProvider } from "next-themes"
import { Figtree, Google_Sans_Code, Inter, Marcellus } from "next/font/google"
import type { PropsWithChildren } from "react"
import "../globals.css"

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
const fontMarcellus = Marcellus({ subsets: ["latin"], variable: "--font-marcellus", weight: ["400"] })

export default async function RootLayout({ children }: PropsWithChildren) {
  const authState = await getAuthenticatedUser()
  // Hide the Auth0 user from the client when no usable token exists, so a stale cookie is not treated as logged-in.
  const auth0User = authState.sessionUser ?? undefined

  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning className="scroll-smooth">
      <body
        className={cn(
          fontTitle.variable,
          fontBody.variable,
          fontMono.variable,
          fontMarcellus.variable,
          "scrollbar-gutter-both overflow-x-clip bg-white dark:bg-stone-900"
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
