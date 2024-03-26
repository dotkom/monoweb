"use client"

import { SessionProvider } from "next-auth/react"
import { type PropsWithChildren } from "react"
import { type Session } from "next-auth"

export type AuthProviderProps = PropsWithChildren & {
  session: Session | null
}

export const AuthProvider = ({ children, session }: AuthProviderProps) => (
  <SessionProvider session={session}>{children}</SessionProvider>
)
