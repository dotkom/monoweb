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

export const mapAuditLogOperationToLabel = (operation: string): string => {
  switch (operation) {
    case "INSERT":
      return "Opprettet"
    case "UPDATE":
      return "Endret"
    case "DELETE":
      return "Slettet"
    default:
      return operation
  }
}

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

export const mapAuditLogTableToLabel = (table: string): string => {
  switch (table) {
    case "article":
      return "Artikkel"
    case "attendee":
      return "Attendee"
    case "attendance_pool":
      return "Påmeldingsgruppe"
    case "attendance":
      return "Påmelding"
    case "company":
      return "Bedrift"
    case "event":
      return "Arrangement"
    case "event_hosting_group":
      return "Arrangement - gruppe"
    case "event_company":
      return "Arrangement - bedrift"
    case "feedback_form":
      return "Tilbakemeldingsskjema"
    case "feedback_form_answer":
      return "Tilbakemeldingsskjema - svar"
    case "feedback_question":
      return "Tilbakemeldingsskjema - spørsmål"
    case "feedback_question_answer":
      return "Tilbakemeldingsskjema - spørsmål svar"
    case "feedback_question_option":
      return "Tilbakemeldingsskjema - spørsmål alternativ"
    case "feedback_answer_option_link":
      return "Tilbakemeldingsskjema - svar alternativ kobling"
    case "group":
      return "Gruppe"
    case "group_membership":
      return "Gruppemedlemskap"
    case "group_membership_role":
      return "Gruppemedlemskap - rolle"
    case "group_role":
      return "Grupperolle"
    case "job_listing":
      return "Jobbutlysning"
    case "job_listing_location":
      return "Jobbutlysning - lokasjon"
    case "mark":
      return "Prikk"
    case "mark_group":
      return "Prikk - gruppe"
    case "membership":
      return "Medlemskap"
    case "notification_permissions":
      return "Varslingstillatelser"
    case "offline":
      return "Offline"
    case "ow_user":
      return "Bruker"
    case "personal_mark":
      return "Prikk - bruker"
    case "privacy_permissions":
      return "Personverntillatelser"
    case "article_tag":
      return "Artikkel - tag"
    case "article_tag_link":
      return "Artikkel - tag kobling"
    case "deregister_reason":
      return "Avmeldingsårsak"
    default:
      return table
  }
}

export type AuditLogTable = z.infer<typeof AuditLogTable>
