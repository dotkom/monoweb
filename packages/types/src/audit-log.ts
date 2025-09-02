import { schemas } from "@dotkomonline/db/schemas";
import z from "zod";

export const AuditLogSchema = schemas.AuditLogSchema.extend({
  user: schemas.UserSchema.nullable(),
})
  ;

export type AuditLog = z.infer<typeof AuditLogSchema>
export type AuditLogId = AuditLog["id"]
