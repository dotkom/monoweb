"use client"

import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"

export type AuthProviderProps = PropsWithChildren<{}>

export const AuthProvider = ({ children }: AuthProviderProps) => {
  return <SessionProvider>{children}</SessionProvider>
}
