import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { ColorSchemeScript, MantineProvider } from "@mantine/core"
import "@mantine/core/styles.css"

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
