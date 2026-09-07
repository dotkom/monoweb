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

export const NotificationLinkSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("NONE") }),
  z.object({ type: z.literal("URL"), url: z.string().url() }),
  z.object({ type: z.literal("EVENT"), eventId: z.string() }),
  z.object({ type: z.literal("ARTICLE"), articleSlug: z.string() }),
  z.object({ type: z.literal("GROUP"), groupSlug: z.string() }),
  z.object({ type: z.literal("USER"), userId: z.string() }),
  z.object({ type: z.literal("OFFLINE"), offlineId: z.string() }),
  z.object({ type: z.literal("JOB_LISTING"), jobListingId: z.string() }),
])

export type NotificationLink = z.infer<typeof NotificationLinkSchema>

export interface NotificationLinkColumns {
  payloadType: NotificationPayloadType
  payload: string | null
}

export function serializeNotificationLink(link: NotificationLink): NotificationLinkColumns {
  switch (link.type) {
    case "NONE":
      return { payloadType: "NONE", payload: null }
    case "URL":
      return { payloadType: "URL", payload: link.url }
    case "EVENT":
      return { payloadType: "EVENT", payload: link.eventId }
    case "ARTICLE":
      return { payloadType: "ARTICLE", payload: link.articleSlug }
    case "GROUP":
      return { payloadType: "GROUP", payload: link.groupSlug }
    case "USER":
      return { payloadType: "USER", payload: link.userId }
    case "OFFLINE":
      return { payloadType: "OFFLINE", payload: link.offlineId }
    case "JOB_LISTING":
      return { payloadType: "JOB_LISTING", payload: link.jobListingId }
  }
}

export function parseNotificationLink(columns: NotificationLinkColumns): NotificationLink {
  const { payloadType, payload } = columns

  if (payloadType === "NONE" || payload === null) {
    return { type: "NONE" }
  }

  switch (payloadType) {
    case "URL":
      return { type: "URL", url: payload }
    case "EVENT":
      return { type: "EVENT", eventId: payload }
    case "ARTICLE":
      return { type: "ARTICLE", articleSlug: payload }
    case "GROUP":
      return { type: "GROUP", groupSlug: payload }
    case "USER":
      return { type: "USER", userId: payload }
    case "OFFLINE":
      return { type: "OFFLINE", offlineId: payload }
    case "JOB_LISTING":
      return { type: "JOB_LISTING", jobListingId: payload }
  }
}

export const NotificationAudienceRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ALL_USERS"),
  }),
  z.object({
    type: z.literal("USERS"),
    userIds: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal("GROUP_MEMBERS"),
    groupSlug: z.string(),
    includeInactiveMembers: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("EVENT_ATTENDEES"),
    attendanceId: z.string(),
    includeUnreservedAttendees: z.boolean().default(false),
    attendancePoolIds: z.array(z.string()).min(1).optional(),
  }),
])

export type NotificationAudienceRule = z.infer<typeof NotificationAudienceRuleSchema>
export type NotificationAudienceRuleType = NotificationAudienceRule["type"]

export const NotificationAudienceSchema = z.object({
  rules: z.array(NotificationAudienceRuleSchema).min(1, "Minst én mottakerregel er påkrevd"),
  excludedUserIds: z.array(z.string()).default([]),
})

/**
 * The notification's rules for who should and should not receive the notification.
 *
 * Recipients are materialized from this once. It is not re-evaluated for people who later join a targeted group or
 * event.
 */
export type NotificationAudience = z.infer<typeof NotificationAudienceSchema>

export const ResolvedAudienceRecipientSchema = z.object({
  userId: z.string(),
  sourceLabels: z.array(z.string()).min(1),
})

export type ResolvedAudienceRecipient = z.infer<typeof ResolvedAudienceRecipientSchema>

export const ResolvedAudienceSchema = z.object({
  /** Users who will receive the notification, after exclusions and preferences. */
  recipients: z.array(ResolvedAudienceRecipientSchema),
  /** Number of (rule, user) matches before de-duplication. */
  matchCount: z.number().int().nonnegative(),
  /** Users matched by more than one rule. */
  duplicateCount: z.number().int().nonnegative(),
  /** Users removed by `excludedUserIds`. */
  excludedCount: z.number().int().nonnegative(),
  /** Users removed because they have opted out of this notification type. */
  optedOutCount: z.number().int().nonnegative(),
})

export type ResolvedAudience = z.infer<typeof ResolvedAudienceSchema>

export const NotificationAudiencePreviewSchema = ResolvedAudienceSchema.omit({ recipients: true }).extend({
  recipientCount: z.number().int().nonnegative(),
  sample: z.array(
    ResolvedAudienceRecipientSchema.extend({
      name: z.string().nullable(),
      imageUrl: z.string().nullable(),
    })
  ),
})

export type NotificationAudiencePreview = z.infer<typeof NotificationAudiencePreviewSchema>

export const NotificationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  shortDescription: z.string(),
  content: z.string(),
  type: NotificationTypeSchema,
  link: NotificationLinkSchema,
  /** The group the notification is sent on behalf of. Null for system notifications. */
  actorGroupId: z.string().nullable(),
  actorGroup: GroupSchema.nullable(),
  /** The user who triggered the notification, for auditing. Null for system-generated notifications. */
  createdById: z.string().nullable(),
  lastUpdatedById: z.string().nullable(),
  taskId: z.string().nullable(),
})

export type Notification = z.infer<typeof NotificationSchema>
export type NotificationId = Notification["id"]

/**
 * Notification with its audience rules.
 */
export const NotificationManagementSchema = NotificationSchema.extend({
  audience: NotificationAudienceSchema.nullable(),
})

export type NotificationManagement = z.infer<typeof NotificationManagementSchema>

export const NotificationWriteSchema = NotificationSchema.pick({
  title: true,
  shortDescription: true,
  content: true,
  type: true,
  link: true,
  actorGroupId: true,
  createdById: true,
  taskId: true,
}).extend({
  audience: NotificationAudienceSchema,
})

export type NotificationWrite = z.infer<typeof NotificationWriteSchema>

export const NotificationUpdateSchema = NotificationSchema.pick({
  title: true,
  shortDescription: true,
  content: true,
  link: true,
})
  .partial()
  .extend({
    lastUpdatedById: z.string(),
  })

export type NotificationUpdate = z.infer<typeof NotificationUpdateSchema>

export const NotificationCreateSchema = z.object({
  title: z.string().min(1, "Tittel er påkrevd").max(120),
  shortDescription: z.string().min(1, "Kort beskrivelse er påkrevd").max(160),
  content: z.string().optional(),
  type: z.enum(["BROADCAST", "BROADCAST_IMPORTANT"]),
  link: NotificationLinkSchema.default({ type: "NONE" }),
  actorGroupId: z.string().min(1, "Avsender er påkrevd"),
  audience: NotificationAudienceSchema,
})

export type NotificationCreate = z.infer<typeof NotificationCreateSchema>

export const NotificationFilterQuerySchema = z
  .object({
    byType: NotificationTypeSchema.array(),
    byActorGroupId: z.string().array(),
    /** All notifications pointing to a specific entity, e.g. every notification about one event. */
    byLink: NotificationLinkSchema,
  })
  .partial()

export type NotificationFilterQuery = z.infer<typeof NotificationFilterQuerySchema>

export const NotificationRecipientSchema = z.object({
  id: z.string(),
  notificationId: z.string(),
  userId: z.string(),
  readAt: z.date().nullable(),
})

export type NotificationRecipient = z.infer<typeof NotificationRecipientSchema>
export type NotificationRecipientId = NotificationRecipient["id"]

export const NotificationRecipientListItemSchema = NotificationRecipientSchema.extend({
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
})

export type NotificationRecipientListItem = z.infer<typeof NotificationRecipientListItemSchema>

export const NotificationRecipientStatsSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  readCount: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
})

export type NotificationRecipientStats = z.infer<typeof NotificationRecipientStatsSchema>

export const UserNotificationSchema = z.object({
  id: NotificationRecipientSchema.shape.id,
  readAt: NotificationRecipientSchema.shape.readAt,
  notification: NotificationSchema,
})

export type UserNotification = z.infer<typeof UserNotificationSchema>

export const NOTIFICATION_TYPE_LABELS = {
  BROADCAST: "Generell varsling",
  BROADCAST_IMPORTANT: "Viktig varsling",
  EVENT_REGISTRATION: "Påmelding åpnet",
  EVENT_REMINDER: "Påminnelse om arrangement",
  EVENT_UPDATE: "Oppdatering om arrangement",
  JOB_LISTING_REMINDER: "Påminnelse om stillingsutlysning",
  NEW_ARTICLE: "Ny artikkel",
  NEW_EVENT: "Nytt arrangement",
  NEW_FEEDBACK_FORM: "Nytt tilbakemeldingsskjema",
  NEW_INTEREST_GROUP: "Ny interessegruppe",
  NEW_JOB_LISTING: "Ny stillingsutlysning",
  NEW_MARK: "Ny prikk",
  NEW_OFFLINE: "Ny Offline-utgave",
} as const satisfies Record<NotificationType, string>

export function getNotificationTypeLabel(notificationType: NotificationType): string {
  return NOTIFICATION_TYPE_LABELS[notificationType]
}

export const NOTIFICATION_LINK_TYPE_LABELS = {
  NONE: "Ingen",
  URL: "Lenke",
  EVENT: "Arrangement",
  ARTICLE: "Artikkel",
  GROUP: "Gruppe",
  USER: "Bruker",
  OFFLINE: "Offline",
  JOB_LISTING: "Stillingsutlysning",
} as const satisfies Record<NotificationLink["type"], string>

export function getNotificationLinkTypeLabel(linkType: NotificationLink["type"]): string {
  return NOTIFICATION_LINK_TYPE_LABELS[linkType]
}
