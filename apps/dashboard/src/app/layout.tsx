import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@mdxeditor/editor/style.css"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import type { PropsWithChildren } from "react"
import { auth } from "../auth"
import { QueryProvider } from "./QueryProvider"
import { ModalProvider } from "./ModalProvider"
import { Notifications } from "@mantine/notifications"

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  return (
    <html lang="en" {...mantineHtmlProps}>
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
