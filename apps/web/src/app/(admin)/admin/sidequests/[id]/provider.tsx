"use client"

import type { SidequestSummaryWithRequest } from "@dotkomonline/rpc/sidequest"
import { createContext, useContext } from "react"

export const SidequestDetailsContext = createContext<{
  sidequest: SidequestSummaryWithRequest
} | null>(null)

export const useSidequestDetailsContext = () => {
  const context = useContext(SidequestDetailsContext)
  if (context === null) {
    throw new Error("useSidequestDetailsContext called without Provider in tree")
  }

  return context
}
