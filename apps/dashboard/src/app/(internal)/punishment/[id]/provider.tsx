"use client"

import type { Mark } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const MarkDetailsContext = createContext<{
  mark: Mark
} | null>(null)

export const useMarkDetailsContext = () => {
  const ctx = useContext(MarkDetailsContext)
  if (ctx === null) {
    throw new Error("useMarkDetailsContext called without Provider in tree")
  }
  return ctx
}
