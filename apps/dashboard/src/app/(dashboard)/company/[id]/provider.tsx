"use client"

import type { Company } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const CompanyDetailsContext = createContext<{
  company: Company
} | null>(null)

export const useCompanyDetailsContext = () => {
  const ctx = useContext(CompanyDetailsContext)
  if (ctx === null) {
    throw new Error("useCompanyDetailsContext called without Provider in tree")
  }
  return ctx
}
