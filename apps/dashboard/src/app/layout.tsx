import { type PropsWithChildren } from "react"
import { ColorSchemeScript } from "@mantine/core"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { MantineProvider } from "./MantineProvider"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/dates/styles.css"

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
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
