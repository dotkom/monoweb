import type { z } from "zod"

import { schemas } from "@dotkomonline/db"

export const AuditlogSchema = schemas.AuditlogSchema.extend({})

export type Auditlog = z.infer<typeof AuditlogSchema>
export type AuditlogId = Auditlog["id"]

export const AuditlogWriteSchema = AuditlogSchema.omit({
  id: true,
  createdAt: true,
})

export type AuditlogWrite = z.infer<typeof AuditlogWriteSchema>