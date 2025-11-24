import { ColorSchemeScript, MantineProvider, createTheme, mantineHtmlProps } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@fontsource/inter/300.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/inter/800.css"
import "@fontsource/inter-tight/300.css"
import "@fontsource/inter-tight/400.css"
import "@fontsource/inter-tight/500.css"
import "@fontsource/inter-tight/600.css"
import "@fontsource/inter-tight/700.css"
import "@fontsource/inter-tight/800.css"
import { auth } from "@/lib/auth"
import { server } from "@/lib/trpc-server"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import { Notifications } from "@mantine/notifications"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import type { Metadata } from "next"
import PlausibleProvider from "next-plausible"
import type { PropsWithChildren } from "react"
import { ApplicationShell } from "./ApplicationShell"
import { ModalProvider } from "./ModalProvider"
import { QueryProvider } from "./QueryProvider"

setDateFnsDefaultOptions({ locale: nb })

export const metadata: Metadata = {
  title: "OnlineWeb Dashboard",
  description: "Administratorsystemet for Linjeforeningen Online",
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

export const dynamic = "force-dynamic"

const theme = createTheme({
  fontFamily: "Inter",
  headings: {
    fontFamily: "Inter Tight",
  },
})

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()

  const isAdmin = await server.user.isAdmin.query()
  return (
    <html lang="no" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <PlausibleProvider domain="dashboard.online.ntnu.no">
          <SessionProvider session={session}>
            <QueryProvider>
              <MantineProvider defaultColorScheme="auto" theme={theme}>
                <Notifications />
                <ModalProvider>
                  <ApplicationShell isAdmin={isAdmin}>{children}</ApplicationShell>
                </ModalProvider>
              </MantineProvider>
            </QueryProvider>
          </SessionProvider>
        </PlausibleProvider>
      </body>
    </html>
  )
}
