"use client"

import type { Contest, ContestantDetail } from "@dotkomonline/types"
import { createContext, useContext } from "react"

export interface ContestContextValue {
  contest: Contest
  contestants: ContestantDetail[]
}

export const ContestContext = createContext<ContestContextValue | null>(null)

export const useContestContext = () => {
  const ctx = useContext(ContestContext)
  if (ctx === null) {
    throw new Error("useContestContext called without Provider in tree")
  }
  return ctx
}
