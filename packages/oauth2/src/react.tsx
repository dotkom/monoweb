"use client"

import { type FC, type PropsWithChildren, createContext, useContext } from "react"
import type { Session } from "./session"

export const SessionContext = createContext<Session | null>(null)
export const useSession = (): Session | null => useContext(SessionContext)

export const SessionProvider: FC<{ session: Session | null } & PropsWithChildren> = ({ session, children }) => {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
