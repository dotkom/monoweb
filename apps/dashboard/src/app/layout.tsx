import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@mdxeditor/editor/style.css"
import { Login } from "@/components/views/Login"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import type { Session } from "@dotkomonline/oauth2/session"
import { Notifications } from "@mantine/notifications"
import type { PropsWithChildren } from "react"
import { auth } from "../auth"
import { ApplicationShell } from "./ApplicationShell"
import { ModalProvider } from "./ModalProvider"
import { QueryProvider } from "./QueryProvider"

function BaseLayout({ session, children }: PropsWithChildren<{ session: Session | null }>) {
  return (
    <html lang="no" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <SessionProvider session={session}>
          <QueryProvider>
            <MantineProvider defaultColorScheme="auto">
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
