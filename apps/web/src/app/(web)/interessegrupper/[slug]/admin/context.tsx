"use client"

import type { AppSession } from "@/auth"
import type { Group } from "@dotkomonline/rpc/group"
import { createContext, useContext } from "react"

export const InterestGroupAdminContext = createContext<{
  group: Group
  session: AppSession
} | null>(null)

export const useInterestGroupAdminContext = () => {
  const ctx = useContext(InterestGroupAdminContext)
  if (ctx === null) {
    throw new Error("useInterestGroupAdminContext called without Provider in tree")
  }

  return ctx
}
