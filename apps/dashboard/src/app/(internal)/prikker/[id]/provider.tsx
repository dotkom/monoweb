"use client"

import type { Mark } from "@dotkomonline/rpc/mark"
import { createContext, useContext } from "react"

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
