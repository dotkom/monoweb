"use client"

import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"
import { Session } from "next-auth"

export type AuthProviderProps = PropsWithChildren & {
  session?: Session
}

export const AuthProvider = ({ children, session }: AuthProviderProps) => {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
