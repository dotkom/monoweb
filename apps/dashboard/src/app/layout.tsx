"use client"
import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { MantineColorSchemeProvider, MantineProvider } from "./MantineProvider"
import { ApplicationShell } from "./ApplicationShell"
import "./root.css"

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head />
      <body>
        <MantineColorSchemeProvider>
          <MantineProvider>
            <AuthProvider session={null}>
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
