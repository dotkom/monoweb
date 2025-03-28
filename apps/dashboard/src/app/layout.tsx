import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core"
import "@mantine/core/styles.css"
import "@mantine/dates/styles.css"
import "@mantine/notifications/styles.css"
import "@mdxeditor/editor/style.css"
import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { MantineProvider } from "./MantineProvider"
import { QueryProvider } from "./QueryProvider"

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <AuthProvider>
          <QueryProvider>
            <MantineProvider>{children}</MantineProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
