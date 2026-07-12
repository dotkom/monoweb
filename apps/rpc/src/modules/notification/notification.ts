import { z } from "zod"
import { GroupSchema } from "../group/group"

export const NotificationTypeSchema = z.enum([
  "BROADCAST",
  "BROADCAST_IMPORTANT",
  "EVENT_REGISTRATION",
  "EVENT_REMINDER",
  "EVENT_UPDATE",
  "JOB_LISTING_REMINDER",
  "NEW_ARTICLE",
  "NEW_EVENT",
  "NEW_FEEDBACK_FORM",
  "NEW_INTEREST_GROUP",
  "NEW_JOB_LISTING",
  "NEW_MARK",
  "NEW_OFFLINE",
])

export type NotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationPayloadTypeSchema = z.enum([
  "NONE",
  "URL",
  "EVENT",
  "ARTICLE",
  "GROUP",
  "USER",
  "OFFLINE",
  "JOB_LISTING",
])

export type NotificationPayloadType = z.infer<typeof NotificationPayloadTypeSchema>

export const NotificationRecipientSchema = z.object({
  id: z.string(),
  userId: z.string(),
  readAt: z.coerce.date().nullable(),
})

export type NotificationRecipient = z.infer<typeof NotificationRecipientSchema>

export const NotificationSchema = z.object({
  id: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string(),
  shortDescription: z.string().nullable(),
  content: z.string(),
  type: NotificationTypeSchema,
  payload: z.string().nullable(),
  payloadType: NotificationPayloadTypeSchema,
  actorGroupId: z.string().nullable(),
  actorGroup: GroupSchema.nullable(),
  createdById: z.string().nullable(),
  // createdBy: UserSchema.nullable(),
  lastUpdatedById: z.string().nullable(),
  // lastUpdatedBy: UserSchema.nullable(),
  taskId: z.string().nullable(),
  // task: TaskSchema.nullable(),
  // recipients: z.array(NotificationRecipientSchema),
})

export type Notification = z.infer<typeof NotificationSchema>

export const NotificationWriteSchema = NotificationSchema.pick({
  title: true,
  shortDescription: true,
  content: true,
  type: true,
  payload: true,
  payloadType: true,
  actorGroupId: true,
  taskId: true,
}).extend({
  recipientIds: z.array(z.string()),
})

export type NotificationWrite = z.infer<typeof NotificationWriteSchema>

// ---- Additional Types ----

export const UserNotificationSchema = z.object({
  id: z.string(),
  readAt: z.coerce.date().nullable(),
  notification: NotificationSchema,
})

export type UserNotification = z.infer<typeof UserNotificationSchema>

// ---- ID Types ----

export type NotificationId = Notification["id"]

export type NotificationRecipientId = NotificationRecipient["id"]

// ---- DTOs ----

export const NotificationDTOSchema = NotificationSchema.pick({
  id: true,
  createdAt: true,
  updatedAt: true,
  title: true,
  shortDescription: true,
  content: true,
  type: true,
  payload: true,
  payloadType: true,
  actorGroupId: true,
  createdById: true,
  lastUpdatedById: true,
  taskId: true,
  actorGroup: true,
})

export type NotificationDTO = z.infer<typeof NotificationDTOSchema>

export const UserNotificationDTOSchema = UserNotificationSchema.pick({
  id: true,
  readAt: true,
}).extend({
  notification: NotificationDTOSchema,
})

export type UserNotificationDTO = z.infer<typeof UserNotificationDTOSchema>

export const mapNotificationTypeToLabel = (notificationType: NotificationType) => {
  switch (notificationType) {
    case "BROADCAST":
      return "Generell varsling"
    case "BROADCAST_IMPORTANT":
      return "Viktig varsling"
    case "EVENT_REGISTRATION":
      return "Påmelding til arrangement"
    case "EVENT_REMINDER":
      return "Påminnelse om arrangement"
    case "EVENT_UPDATE":
      return "Oppdatering om arrangement"
    case "JOB_LISTING_REMINDER":
      return "Påminnelse om stillingsutlysning"
    case "NEW_ARTICLE":
      return "Ny artikkel"
    case "NEW_EVENT":
      return "Nytt arrangement"
    case "NEW_FEEDBACK_FORM":
      return "Nytt tilbakemeldingsskjema"
    case "NEW_INTEREST_GROUP":
      return "Ny interessegruppe"
    case "NEW_JOB_LISTING":
      return "Ny stillingsutlysning"
    case "NEW_MARK":
      return "Ny prikk"
    case "NEW_OFFLINE":
      return "Ny offline"
    default:
      return "Ukjent"
  }
}

export const mapNotificationPayloadTypeToLabel = (payloadType: NotificationPayloadType) => {
  switch (payloadType) {
    case "URL":
      return "Url"
    case "EVENT":
      return "Arrangement"
    case "ARTICLE":
      return "Artikkel"
    case "GROUP":
      return "Gruppe"
    case "USER":
      return "Bruker"
    case "OFFLINE":
      return "Offline"
    case "JOB_LISTING":
      return "Stillingsutlysning"
    case "NONE":
      return "Ingen"
  }
}
