import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../pages/api/auth/[...nextauth]"
import { QueryProvider } from "./QueryProvider"
import { MantineProvider } from "./MantineProvider"
import { ApplicationShell } from "./ApplicationShell"
import "./root.css"

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await unstable_getServerSession(authOptions)

  return (
    <html lang="en">
      <head />
      <body>
        <MantineProvider>
          <AuthProvider session={session}>
            <QueryProvider>
              <ApplicationShell>{children}</ApplicationShell>
            </QueryProvider>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
