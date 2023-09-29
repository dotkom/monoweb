import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { ColorSchemeScript, MantineProvider } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import { ModalProvider } from "./ModalProvider"
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
              <ModalProvider>{children}</ModalProvider>
            </MantineProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
