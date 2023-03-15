"use client"
import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { MantineColorSchemeProvider, MantineProvider } from "./MantineProvider"
import { ApplicationShell } from "./ApplicationShell"
import "./root.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@dotkomonline/auth"

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en">
      <head />
      <body>
        <MantineColorSchemeProvider>
          <MantineProvider>
            <AuthProvider session={session}>
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
