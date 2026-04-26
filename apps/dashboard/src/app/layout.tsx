import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@fontsource-variable/inter/wght.css"
import "@fontsource-variable/inter-tight/wght.css"
import "@fontsource-variable/google-sans-code/wght.css"
import { auth0 } from "@/lib/auth"
import { getServerAccessToken } from "@/lib/server-access-token"
import { getServerAuthorization } from "@/lib/server-authorization"
import { Auth0Provider } from "@auth0/nextjs-auth0/client"
import { Notifications } from "@mantine/notifications"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import type { Metadata } from "next"
import PlausibleProvider from "next-plausible"
import type { PropsWithChildren } from "react"
import { AuthorizationProvider } from "@/auth/authorization-context"
import { ApplicationShell } from "./ApplicationShell"
import { ModalProvider } from "./ModalProvider"
import { QueryProvider } from "./QueryProvider"

setDateFnsDefaultOptions({ locale: nb })

export const metadata: Metadata = {
  title: "OnlineWeb Dashboard",
  description: "Administratorsystemet for Online, linjeforeningen for informatikkstudenter ved NTNU i Trondheim.",
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

export const dynamic = "force-dynamic"

const theme = createTheme({
  fontFamily: "Inter Variable",
  fontFamilyMonospace: "Google Sans Code Variable",
  headings: {
    fontFamily: "Inter Tight Variable",
  },
})

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth0.getSession()
  const accessToken = await getServerAccessToken()
  // Hide the Auth0 user from the client when no usable token exists, so a stale cookie is not treated as logged-in.
  const auth0User = accessToken !== null && session?.user !== undefined ? session.user : undefined

  const { isAdministrator, isCommitteeMember, affiliations } = await getServerAuthorization()

  return (
    <html lang="no" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <PlausibleProvider domain="dashboard.online.ntnu.no">
          <Auth0Provider user={auth0User}>
            <QueryProvider>
              <MantineProvider defaultColorScheme="auto" theme={theme}>
                <Notifications />
                <ModalProvider>
                  <AuthorizationProvider
                    isAdministrator={isAdministrator}
                    isCommitteeMember={isCommitteeMember}
                    affiliations={affiliations}
                  >
                    <ApplicationShell>{children}</ApplicationShell>
                  </AuthorizationProvider>
                </ModalProvider>
              </MantineProvider>
            </QueryProvider>
          </Auth0Provider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
