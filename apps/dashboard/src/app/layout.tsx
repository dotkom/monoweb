import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { ColorSchemeScript, MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { ModalsProvider } from "@mantine/modals"
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
            <MantineProvider>
              <Notifications />
              <ModalsProvider>{children}</ModalsProvider>
            </MantineProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
