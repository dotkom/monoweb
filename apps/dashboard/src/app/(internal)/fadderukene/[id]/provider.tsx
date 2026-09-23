"use client"

import type { Fadderuke } from "@dotkomonline/rpc/fadderuke"
import { createContext, useContext } from "react"

export const FadderukeDetailsContext = createContext<{
  fadderuke: Fadderuke
} | null>(null)

export const useFadderukeDetailsContext = () => {
  const ctx = useContext(FadderukeDetailsContext)
  if (ctx === null) {
    throw new Error("useFadderukeDetailsContext called without Provider in tree")
  }
  return ctx
}
