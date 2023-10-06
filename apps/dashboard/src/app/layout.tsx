import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { ColorSchemeScript } from "@mantine/core"
import { MantineProvider } from "./MantineProvider"
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"
import "@mantine/dates/styles.css"

export default async function RootLayout({ children }: PropsWithChildren) {
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
