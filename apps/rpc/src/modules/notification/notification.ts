import { schemas } from "@dotkomonline/db/schemas"
import { buildSearchFilter } from "@dotkomonline/types"
import { z } from "zod"

export type Notification = z.infer<typeof NotificationSchema>
export const NotificationSchema = schemas.NotificationSchema
export type NotificationId = Notification["id"]
export type NotificationType = Notification["type"]
export type NotificationPayloadType = Notification["payloadType"]

export const NotificationTypeSchema = schemas.NotificationTypeSchema
export const NotificationPayloadTypeSchema = schemas.NotificationPayloadTypeSchema

export const NotificationRecipientSchema = schemas.NotificationRecipientSchema
export type NotificationRecipient = z.infer<typeof NotificationRecipientSchema>

export type NotificationRecipientId = NotificationRecipient["id"]

export type UserNotification = z.infer<typeof UserNotificationSchema>
export const UserNotificationSchema = schemas.NotificationRecipientSchema.extend({
  notification: schemas.NotificationSchema,
})

export type NotificationWrite = z.infer<typeof NotificationWriteSchema>
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
  recipientIds: z.array(z.string().uuid()),
})



export const mapNotificationTypeToLabel = (notificationType: NotificationType) => {
  switch (notificationType) {
    case "BROADCAST":
      return "Generell varsling";
    case "BROADCAST_IMPORTANT":
      return "Viktig varsling";
    case "EVENT_REGISTRATION":
      return "Påmelding til arrangement";
    case "EVENT_REMINDER":
      return "Påminnelse om arrangement";
    case "EVENT_UPDATE":
      return "Oppdatering om arrangement";
    case "JOB_LISTING_REMINDER":
      return "Påminnelse om stillingsutlysning";
    case "NEW_ARTICLE":
      return "Ny artikkel";
    case "NEW_EVENT":
      return "Nytt arrangement";
    case "NEW_FEEDBACK_FORM":
      return "Nytt tilbakemeldingsskjema";
    case "NEW_INTEREST_GROUP":
      return "Ny interessegruppe";
    case "NEW_JOB_LISTING":
      return "Ny stillingsutlysning";
    case "NEW_MARK":
      return "Ny prikk";
    case "NEW_OFFLINE":
      return "Ny offline";
    default:
      return "Ukjent";
  }
}


export const mapNotificationPayloadTypeToLabel = (payloadType: NotificationPayloadType) => {
  switch (payloadType) {
    case "URL":
      return "Url";
    case "EVENT":
      return "Arrangement";
    case "ARTICLE":
      return "Artikkel";
    case "GROUP":
      return "Gruppe";
    case "USER":
      return "Bruker";
    case "OFFLINE":
      return "Offline";
    case "JOB_LISTING":
      return "Stillingsutlysning";
    case "NONE":
      return "Ingen";
  }
}