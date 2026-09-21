"use client"

import { AuditLogDetails } from "../AuditLogDetails"
import { useAuditLogDetailsQuery } from "./provider"

export default function AuditLogJsonPage() {
  const { auditLog } = useAuditLogDetailsQuery()

  return <AuditLogDetails auditLog={auditLog} view="json" />
}
