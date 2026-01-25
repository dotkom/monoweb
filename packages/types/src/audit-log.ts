import { schemas } from "@dotkomonline/db/schemas"
import z from "zod"
import { buildSearchFilter } from "./filters"
import { UserSchema } from "./user"

export const AuditLogSchema = schemas.AuditLogSchema.extend({
  user: schemas.UserSchema.nullable(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>
export type AuditLogId = AuditLog["id"]
export type AuditLogFilterQuery = z.infer<typeof AuditLogFilterQuerySchema>
export const AuditLogFilterQuerySchema = z
  .object({
    bySearchTerm: buildSearchFilter(),
    byUserId: z.array(UserSchema.shape.id).optional(),
  })
  .partial()
