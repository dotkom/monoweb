import { schemas } from "@dotkomonline/db/schemas"
import z from "zod"
import { buildAnyOfFilter, buildSearchFilter } from "./filters"

export const AuditLogSchema = schemas.AuditLogSchema.extend({
  user: schemas.UserSchema.nullable(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>
export type AuditLogId = AuditLog["id"]
export type AuditLogFilterQuery = z.infer<typeof AuditLogFilterQuerySchema>
export const AuditLogFilterQuerySchema = z
  .object({
    byId: buildAnyOfFilter(AuditLogSchema.shape.id),
    bySearchTerm: buildSearchFilter(),
  })
  .partial()
