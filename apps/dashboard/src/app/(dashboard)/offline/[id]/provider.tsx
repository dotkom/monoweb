"use client"

import { createContext, useContext } from "react"
import { type Offline } from "@dotkomonline/types"

/** Context consisting of everything required to use and render the form */
export const OfflineDetailsContext = createContext<{
  offline: Offline
} | null>(null)

export const useOfflineDetailsContext = () => {
  const ctx = useContext(OfflineDetailsContext)
  if (ctx === null) {
    throw new Error("useOfflineDetailsContext called without Provider in tree")
  }
  return ctx
}
