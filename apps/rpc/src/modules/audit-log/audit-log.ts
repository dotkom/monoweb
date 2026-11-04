import { buildSearchFilter } from "@dotkomonline/utils"
import { z } from "zod"
import { UserSchema } from "../user/user"

export const AuditLogTable = z.enum([
  "article",
  "attendee",
  "attendance_pool",
  "company",
  "event",
  "event_hosting_group",
  "feedback_answer_option_link",
  "feedback_form",
  "feedback_form_answer",
  "feedback_question",
  "feedback_question_answer",
  "feedback_question_option",
  "group",
  "group_membership",
  "group_membership_role",
  "group_role",
  "job_listing",
  "job_listing_location",
  "mark",
  "membership",
  "notification_permissions",
  "offline",
  "ow_user",
  "personal_mark",
  "privacy_permissions",
  "mark_group",
  "article_tag",
  "article_tag_link",
  "attendance",
  "deregister_reason",
  "event_company",
  "contest",
  "contestant",
  "contest_team",
  "fadderuke",
  "notification",
])

export const AuditLogOperation = z.enum(["INSERT", "UPDATE", "DELETE"])

export const AuditLogSchema = z.object({
  id: z.string(),
  tableName: z.string(),
  rowId: z.string().nullable(),
  createdAt: z.date(),
  operation: z.string(),
  rowData: z.unknown(),
  transactionId: z.bigint(),
  auditTransactionId: z.string().nullable(),
  userId: z.string().nullable(),
  user: UserSchema.omit({ memberships: true }).nullable(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>
export type AuditLogId = AuditLog["id"]
export type AuditLogFilterQuery = z.infer<typeof AuditLogFilterQuerySchema>
export const AuditLogFilterQuerySchema = z
  .object({
    bySearchTerm: buildSearchFilter(),
    byUserId: z.array(UserSchema.shape.id).optional(),
    byTableName: z.array(AuditLogTable).optional(),
    byOperation: z.array(AuditLogOperation).optional(),
    byProcedure: z.array(z.string()).optional(),
  })
  .partial()

export type AuditLogTable = z.infer<typeof AuditLogTable>

export const AuditTransactionSchema = z.object({
  id: z.string(),
  name: z.string(),
  procedure: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type AuditTransaction = z.infer<typeof AuditTransactionSchema>

export const AuditTransactionWithLogsSchema = AuditTransactionSchema.extend({
  logs: z.array(AuditLogSchema),
})

export type AuditTransactionWithLogs = z.infer<typeof AuditTransactionWithLogsSchema>

export const AuditActivityTypeSchema = z.enum(["audit_log", "audit_transaction"])
export type AuditActivityType = z.infer<typeof AuditActivityTypeSchema>

export const AuditActivityIdSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  type: AuditActivityTypeSchema,
})

export type AuditActivityId = z.infer<typeof AuditActivityIdSchema>

export const AuditActivitySchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string().nullable(),
  procedure: z.string().nullable(),
  userId: z.string().nullable(),
  user: UserSchema.omit({ memberships: true }).nullable(),
  logs: z.array(AuditLogSchema),
})

export type AuditActivity = z.infer<typeof AuditActivitySchema>
