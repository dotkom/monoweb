"use client"

import type { GroupMember } from "@dotkomonline/types"
import { createContext, useContext } from "react"

export const GroupMemberDetailsContext = createContext<{
  groupMember: GroupMember
} | null>(null)

export const useGroupMemberDetailsContext = () => {
  const ctx = useContext(GroupMemberDetailsContext)
  if (ctx === null) {
    throw new Error("useGroupMemberDetailsContext must be used within a GroupMemberDetailsContext.Provider")
  }
  return ctx
}
