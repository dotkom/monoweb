import { schemas } from "@dotkomonline/db/schemas"
import z from "zod"
import { buildSearchFilter } from "./filters"
import { UserSchema } from "./user"

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
])

export const AuditLogOperation = z.enum(["INSERT", "UPDATE", "DELETE"])

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
    byTableName: z.array(AuditLogTable).optional(),
    byOperation: z.array(AuditLogOperation).optional(),
  })
  .partial()

export type AuditLogTable = z.infer<typeof AuditLogTable>
