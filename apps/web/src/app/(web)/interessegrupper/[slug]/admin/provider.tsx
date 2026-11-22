"use client"

import type { AppSession } from "@/auth"
import type { Group } from "@dotkomonline/rpc/group"
import type { PropsWithChildren } from "react"
import { InterestGroupAdminContext } from "./context"

export function InterestGroupAdminProvider({
  group,
  session,
  children,
}: PropsWithChildren<{ group: Group; session: AppSession }>) {
  return <InterestGroupAdminContext.Provider value={{ group, session }}>{children}</InterestGroupAdminContext.Provider>
}
