"use client"
import { SessionProvider } from "next-auth/react"
import type { PropsWithChildren } from "react"

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <section>
      <SessionProvider>{children}</SessionProvider>
    </section>
  )
}
