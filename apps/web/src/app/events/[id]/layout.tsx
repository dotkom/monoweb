'use client'
import type { PropsWithChildren } from "react"
import { SessionProvider } from "next-auth/react"


export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <section>
        <SessionProvider>
          {children}
        </SessionProvider>
    </section>
  )
}
