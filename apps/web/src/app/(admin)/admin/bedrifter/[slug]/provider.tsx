"use client"

import type { Company } from "@dotkomonline/rpc/company"
import { createContext, useContext } from "react"

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
