import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@mdxeditor/editor/style.css"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import { Notifications } from "@mantine/notifications"
import type { PropsWithChildren } from "react"
import { auth } from "../auth"
import { ModalProvider } from "./ModalProvider"
import { QueryProvider } from "./QueryProvider"

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
