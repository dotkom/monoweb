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
import { Login } from "@/components/views/Login"
import { auth } from "@/lib/auth"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import type { Session } from "@dotkomonline/oauth2/session"
import { Notifications } from "@mantine/notifications"
import { setDefaultOptions as setDateFnsDefaultOptions } from "date-fns"
import { nb } from "date-fns/locale"
import type { PropsWithChildren } from "react"
import { ApplicationShell } from "./ApplicationShell"
import { ModalProvider } from "./ModalProvider"
import { QueryProvider } from "./QueryProvider"

setDateFnsDefaultOptions({ locale: nb })

export const dynamic = "force-dynamic"

const theme = createTheme({
  fontFamily: "Inter",
  headings: {
    fontFamily: "Inter Tight",
  },
})

function BaseLayout({ session, children }: PropsWithChildren<{ session: Session | null }>) {
  return (
    <html lang="no" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <SessionProvider session={session}>
          <QueryProvider>
            <MantineProvider defaultColorScheme="auto" theme={theme}>
              <Notifications />
              <ModalProvider>{children}</ModalProvider>
            </MantineProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()

  if (session === null) {
    return (
      <BaseLayout session={session}>
        <Login />
      </BaseLayout>
    )
  }

  return (
    <BaseLayout session={session}>
      <ApplicationShell>{children}</ApplicationShell>
    </BaseLayout>
  )
}
