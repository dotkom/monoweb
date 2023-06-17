import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { MantineColorSchemeProvider, MantineNotificationsProvider, MantineProvider } from "./MantineProvider"
import { ApplicationShell } from "./ApplicationShell"
import "./root.css"

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head />
      <body>
        <MantineColorSchemeProvider>
          <MantineProvider>
            <MantineNotificationsProvider />
            <AuthProvider>
              <QueryProvider>
                <ApplicationShell>{children}</ApplicationShell>
              </QueryProvider>
            </AuthProvider>
          </MantineProvider>
        </MantineColorSchemeProvider>
      </body>
    </html>
  )
}
