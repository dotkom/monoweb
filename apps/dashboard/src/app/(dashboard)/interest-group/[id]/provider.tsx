"use client"

import { createContext, useContext } from "react"
import { InterestGroup, type Offline } from "@dotkomonline/types"

/** Context consisting of everything required to use and render the form */
export const InterestGroupDetailsContext = createContext<{
  interestGroup: InterestGroup
} | null>(null)

export const useInterestGroupDetailsContext = () => {
  const ctx = useContext(InterestGroupDetailsContext)
  if (ctx === null) {
    throw new Error("useOfflineDetailsContext called without Provider in tree")
  }
  return ctx
}
