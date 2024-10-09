import { z } from "zod"

export const AuditlogSchema = z.object({
  id: z.string().ulid(),
  createdAt: z.date(),
  action: z.string(),
  userId: z.string(),
  type: z.enum(["User", "Company", "Event", "Committee"]),
})

export type AuditlogId = Auditlog["id"]
export type Auditlog = z.infer<typeof AuditlogSchema>

export const AuditlogWriteSchema = AuditlogSchema

export type AuditlogWrite = z.infer<typeof AuditlogSchema>
