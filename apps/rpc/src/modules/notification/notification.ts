import { z } from "zod"

export const NotificationTypeSchema = z.enum([
  "BROADCAST",
  "BROADCAST_IMPORTANT",
  "EVENT_REGISTRATION",
  "EVENT_REMINDER",
  "EVENT_UPDATE",
  "JOB_LISTING_REMINDER",
  "NEW_ARTICLE",
  "NEW_EVENT",
  "NEW_INTEREST_GROUP",
  "NEW_JOB_LISTING",
  "NEW_OFFLINE",
  "NEW_MARK",
  "NEW_FEEDBACK_FORM",
])
export type NotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationPayloadTypeSchema = z.enum([
  "URL",
  "EVENT",
  "ARTICLE",
  "GROUP",
  "USER",
  "OFFLINE",
  "JOB_LISTING",
  "NONE",
])
export type NotificationPayloadType = z.infer<typeof NotificationPayloadTypeSchema>

export const NotificationRecipientSchema = z.object({
  id: z.string(),
  readAt: z.date().nullable(),
  notificationId: z.string(),
  userId: z.string(),
})
export type NotificationRecipient = z.infer<typeof NotificationRecipientSchema>
export type NotificationRecipientId = NotificationRecipient["id"]

export const NotificationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  shortDescription: z.string().nullable(),
  content: z.string(),
  type: NotificationTypeSchema,
  payload: z.string().nullable(),
  payloadType: NotificationPayloadTypeSchema,
  actorGroupId: z.string(),
  createdById: z.string().nullable(),
  lastUpdatedById: z.string().nullable(),
  taskId: z.string().nullable(),
})
export type Notification = z.infer<typeof NotificationSchema>
export type NotificationId = Notification["id"]

export const UserNotificationSchema = NotificationRecipientSchema.extend({
  notification: NotificationSchema,
})
export type UserNotification = z.infer<typeof UserNotificationSchema>

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
  recipientIds: z.array(z.string()).min(1),
})
export type NotificationWrite = z.infer<typeof NotificationWriteSchema>

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
