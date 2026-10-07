import { AuthorizationProvider } from "@admin/auth/authorization-context"
import { bodyFont, titleFont, monospaceFont, marcellusFont } from "@/lib/fonts"
import { auth0 } from "@admin/lib/auth"
import { getServerAccessToken } from "@admin/lib/server-access-token"
import { UNAUTHORIZED_PATH } from "@admin/lib/require-permission"
import { getServerAuthorization } from "@admin/lib/server-authorization"
import {
  NAVIGATION_GROUPS_COLLAPSED_COOKIE_NAME,
  parseNavigationGroupsCollapsedCookie,
} from "@admin/lib/navigation-group-cookie"
import { Auth0Provider } from "@auth0/nextjs-auth0/client"
import { cn, Toaster } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import type { Metadata } from "next"
import PlausibleProvider from "next-plausible"
import { ThemeProvider } from "next-themes"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import type { PropsWithChildren } from "react"
import "@/globals.css"
import { ApplicationShell } from "./ApplicationShell"
import { QueryProvider } from "./QueryProvider"
import { headers } from "next/headers"

setDateFnsDefaultOptions({ locale: nb })

export const metadata: Metadata = {
  title: "OnlineWeb Admin",
  description: "Administratorsystemet for Online, linjeforeningen for informatikkstudenter ved NTNU i Trondheim.",
  icons: {
    icon: [
      { url: "/admin/favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/admin/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/admin/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/admin/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/admin/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/admin/apple-touch-icon.png",
  },
}

export const dynamic = "force-dynamic"

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth0.getSession()
  const accessToken = await getServerAccessToken()

  if (session === null || accessToken === null) {
    redirect(createAuthorizeUrl({ returnTo: "/admin" }))
  }

  // Hide the Auth0 user from the client when no usable token exists, so a stale cookie is not treated as logged-in.
  const auth0User = accessToken !== null && session?.user !== undefined ? session.user : undefined

  const { isAdministrator, isCommitteeMember, affiliations } = await getServerAuthorization()

  if (!isCommitteeMember) {
    redirect(UNAUTHORIZED_PATH)
  }

  const requestHeaders = await headers()
  const userAgent = requestHeaders.get("user-agent") ?? ""
  const isMac = /macintosh/i.test(userAgent)
  const cookieStore = await cookies()
  const collapsedNavigationGroups = parseNavigationGroupsCollapsedCookie(
    cookieStore.get(NAVIGATION_GROUPS_COLLAPSED_COOKIE_NAME)?.value
  )

  return (
    // suppressHydrationWarning is needed for next-themes, see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
    <html lang="no" suppressHydrationWarning className="h-dvh overflow-hidden">
      <body
        className={cn(
          titleFont.variable,
          bodyFont.variable,
          monospaceFont.variable,
          marcellusFont.variable,
          "h-dvh overflow-hidden"
        )}
      >
        <PlausibleProvider domain="online.ntnu.no">
          <Auth0Provider user={auth0User}>
            <QueryProvider>
              <ThemeProvider defaultTheme="system" enableSystem attribute="data-theme">
                <AuthorizationProvider
                  isAdministrator={isAdministrator}
                  isCommitteeMember={isCommitteeMember}
                  affiliations={affiliations}
                >
                  <ApplicationShell isMac={isMac} collapsedNavigationGroups={collapsedNavigationGroups}>
                    {children}
                  </ApplicationShell>
                </AuthorizationProvider>
              </ThemeProvider>
            </QueryProvider>
          </Auth0Provider>
        </PlausibleProvider>
        <Toaster />
      </body>
    </html>
  )
}
