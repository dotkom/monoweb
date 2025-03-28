"use client"

import type { Group } from "@dotkomonline/types"
import { createContext, useContext } from "react"

export const GroupDetailsContext = createContext<{
  group: Group
} | null>(null)

export const useGroupDetailsContext = () => {
  const ctx = useContext(GroupDetailsContext)
  if (ctx === null) {
    throw new Error("useGroupDetailsContext must be used within a GroupDetailsContext.Provider")
  }
  return ctx
}
