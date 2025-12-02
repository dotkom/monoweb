"use client"

import { createContext, type FC, type PropsWithChildren, useContext } from "react"
import type { Session } from "./session"

export const SessionContext = createContext<Session | null>(null)
export const useSession = (): Session | null => useContext(SessionContext)

export const SessionProvider: FC<{ session: Session | null } & PropsWithChildren> = ({ session, children }) => {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
