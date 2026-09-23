"use client"

import type { AuditLog } from "@dotkomonline/rpc/audit-log"
import { createContext, useContext } from "react"

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
