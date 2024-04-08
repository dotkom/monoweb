"use client"

import type { InterestGroup } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const InterestGroupDetailsContext = createContext<{
  interestGroup: InterestGroup
} | null>(null)

export const useInterestGroupDetailsContext = () => {
  const ctx = useContext(InterestGroupDetailsContext)
  if (ctx === null) {
    throw new Error("useInterestGroupDetailsContext must be used within a InterestGroupDetailsContext.Provider")
  }
  return ctx
}
