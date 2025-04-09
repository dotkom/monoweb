import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@mdxeditor/editor/style.css"
import { SessionProvider } from "@dotkomonline/oauth2/react"
import type { PropsWithChildren } from "react"
import { auth } from "../auth"
import { MantineProvider } from "./MantineProvider"
import { QueryProvider } from "./QueryProvider"

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth.getServerSession()
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <SessionProvider session={session}>
          <QueryProvider>
            <MantineProvider>{children}</MantineProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
