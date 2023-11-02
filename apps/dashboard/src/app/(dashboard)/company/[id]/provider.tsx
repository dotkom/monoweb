"use client"

import { createContext, useContext } from "react"
import { type Company } from "@dotkomonline/types"

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
