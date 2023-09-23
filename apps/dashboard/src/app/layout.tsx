import type { PropsWithChildren } from "react"
import { AuthProvider } from "./AuthProvider"
import { QueryProvider } from "./QueryProvider"
import { Heading, Text, Theme } from "@radix-ui/themes"
import { TabMenu } from "./TabMenu"
import "./root.css"
import "@radix-ui/themes/styles.css"

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head />
      <body>
        <Theme>
          <AuthProvider>
            <QueryProvider>
              <main className="flex h-screen">{children}</main>
            </QueryProvider>
          </AuthProvider>
        </Theme>
      </body>
    </html>
  )
}
