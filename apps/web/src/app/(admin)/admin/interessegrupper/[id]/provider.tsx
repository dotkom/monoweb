"use client"

import type { InterestGroupEventSummaryWithRequest } from "@dotkomonline/rpc/interest-group-event"
import { createContext, useContext } from "react"

export const InterestGroupEventDetailsContext = createContext<{
  interestGroupEvent: InterestGroupEventSummaryWithRequest
} | null>(null)

export const useInterestGroupEventDetailsContext = () => {
  const context = useContext(InterestGroupEventDetailsContext)
  if (context === null) {
    throw new Error("useInterestGroupEventDetailsContext called without Provider in tree")
  }

  return context
}
