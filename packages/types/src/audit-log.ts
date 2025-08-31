import { schemas } from "@dotkomonline/db/schemas";
import z from "zod";
import { UserSchema } from "./user";

export const AuditLogSchema = schemas.AuditLogSchema;


export type AuditLog = z.infer<typeof AuditLogSchema>
export type AuditLogId = AuditLog["id"]

export const AuditLogWriteSchema = AuditLogSchema.pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
});

export type AuditLogWrite = z.infer<typeof AuditLogWriteSchema>;