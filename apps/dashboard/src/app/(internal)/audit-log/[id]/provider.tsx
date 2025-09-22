"use client"

import type { AuditLog } from "@dotkomonline/types"
import { createContext, useContext } from "react"

/** Context consisting of everything required to use and render the form */
export const AuditLogDetailsContext = createContext<{
  auditLog: AuditLog
} | null>(null)

export const useAuditLogDetailsQuery = () => {
  const ctx = useContext(AuditLogDetailsContext)

  if (ctx === null) {
    throw new Error("useAuditLogDetailsPage called without Provider in tree")
  }

  return ctx
}
