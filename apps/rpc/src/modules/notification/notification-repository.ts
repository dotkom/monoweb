import type { DBHandle, Prisma } from "@dotkomonline/db"
import { type Pageable, pageQuery } from "@dotkomonline/utils"
import { parseOrReport } from "../../invariant"
import type { UserId } from "../user/user"
import {
  type Notification,
  NotificationAudienceSchema,
  type NotificationFilterQuery,
  type NotificationId,
  type NotificationManagement,
  NotificationManagementSchema,
  type NotificationRecipient,
  type NotificationRecipientListItem,
  NotificationRecipientListItemSchema,
  NotificationRecipientSchema,
  type NotificationRecipientStats,
  NotificationSchema,
  type NotificationUpdate,
  type NotificationWrite,
  type UserNotification,
  UserNotificationSchema,
  parseNotificationLink,
  serializeNotificationLink,
} from "./notification"
import { getCurrentUTC } from "@dotkomonline/utils"

export interface NotificationRepository {
  create(handle: DBHandle, data: NotificationWrite): Promise<NotificationManagement>
  update(handle: DBHandle, notificationId: NotificationId, data: NotificationUpdate): Promise<NotificationManagement>
  delete(handle: DBHandle, notificationId: NotificationId): Promise<void>
  findById(handle: DBHandle, notificationId: NotificationId): Promise<NotificationManagement | null>
  findMany(handle: DBHandle, query: NotificationFilterQuery, page: Pageable): Promise<NotificationManagement[]>

  addRecipients(handle: DBHandle, notificationId: NotificationId, userIds: UserId[]): Promise<NotificationRecipient[]>
  removeRecipients(handle: DBHandle, notificationId: NotificationId, userIds: UserId[]): Promise<number>
  findRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    page: Pageable
  ): Promise<NotificationRecipientListItem[]>
  getRecipientStats(handle: DBHandle, notificationId: NotificationId): Promise<NotificationRecipientStats>

  findManyForUser(handle: DBHandle, userId: UserId, page: Pageable): Promise<UserNotification[]>
  countUnreadForUser(handle: DBHandle, userId: UserId): Promise<number>
  markAsRead(handle: DBHandle, notificationId: NotificationId, userId: UserId): Promise<boolean>
  markAllAsRead(handle: DBHandle, userId: UserId): Promise<number>
}

const INCLUDE_ACTOR_GROUP = {
  actorGroup: {
    include: {
      roles: true,
    },
  },
} as const satisfies Prisma.NotificationInclude

const INCLUDE_RECIPIENT_USER = {
  user: {
    select: {
      id: true,
      name: true,
      imageUrl: true,
    },
  },
} as const satisfies Prisma.NotificationRecipientInclude

type NotificationRow = Prisma.NotificationGetPayload<{ include: typeof INCLUDE_ACTOR_GROUP }>

function mapInboxNotification(row: NotificationRow): Notification {
  const { payloadType, payload, audience: _audience, ...rest } = row

  return parseOrReport(NotificationSchema, {
    ...rest,
    link: parseNotificationLink({ payloadType, payload }),
  })
}

function mapManagedNotification(row: NotificationRow): NotificationManagement {
  const { payloadType, payload, audience, ...rest } = row

  return parseOrReport(NotificationManagementSchema, {
    ...rest,
    link: parseNotificationLink({ payloadType, payload }),
    audience: audience === null ? null : parseOrReport(NotificationAudienceSchema, audience),
  })
}

function buildWhereFromQuery(query: NotificationFilterQuery): Prisma.NotificationWhereInput {
  const where: Prisma.NotificationWhereInput = {}

  if (query.byType !== undefined && query.byType.length > 0) {
    where.type = { in: query.byType }
  }

  if (query.byActorGroupId !== undefined && query.byActorGroupId.length > 0) {
    where.actorGroupId = { in: query.byActorGroupId }
  }

  if (query.byLink !== undefined) {
    const linkColumns = serializeNotificationLink(query.byLink)
    where.payloadType = linkColumns.payloadType
    where.payload = linkColumns.payload
  }

  return where
}

export function getNotificationRepository(): NotificationRepository {
  return {
    async create(handle, data) {
      const { link, ...notificationData } = data

      const row = await handle.notification.create({
        data: {
          ...notificationData,
          ...serializeNotificationLink(link),
        },
        include: INCLUDE_ACTOR_GROUP,
      })

      return mapManagedNotification(row)
    },

    async update(handle, notificationId, data) {
      const { link, ...notificationData } = data

      const row = await handle.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          ...notificationData,
          ...(link !== undefined ? serializeNotificationLink(link) : {}),
        },
        include: INCLUDE_ACTOR_GROUP,
      })

      return mapManagedNotification(row)
    },

    async delete(handle, notificationId) {
      await handle.notification.delete({
        where: {
          id: notificationId,
        },
      })
    },

    async findById(handle, notificationId) {
      const row = await handle.notification.findUnique({
        where: {
          id: notificationId,
        },
        include: INCLUDE_ACTOR_GROUP,
      })

      if (row === null) {
        return null
      }

      return mapManagedNotification(row)
    },

    async findMany(handle, query, page) {
      const rows = await handle.notification.findMany({
        ...pageQuery(page),
        where: buildWhereFromQuery(query),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: INCLUDE_ACTOR_GROUP,
      })

      return rows.map(mapManagedNotification)
    },

    async addRecipients(handle, notificationId, userIds) {
      if (userIds.length === 0) {
        return []
      }

      // skipDuplicates lets us expand an audience later without failing on people who already received it.
      const rows = await handle.notificationRecipient.createManyAndReturn({
        data: userIds.map((userId) => ({
          notificationId,
          userId,
        })),
        skipDuplicates: true,
      })

      return parseOrReport(NotificationRecipientSchema.array(), rows)
    },

    async removeRecipients(handle, notificationId, userIds) {
      if (userIds.length === 0) {
        return 0
      }

      const result = await handle.notificationRecipient.deleteMany({
        where: {
          notificationId,
          userId: {
            in: userIds,
          },
        },
      })

      return result.count
    },

    async findRecipients(handle, notificationId, page) {
      const rows = await handle.notificationRecipient.findMany({
        ...pageQuery(page),
        where: {
          notificationId,
        },
        orderBy: [{ user: { name: "asc" } }, { id: "desc" }],
        include: INCLUDE_RECIPIENT_USER,
      })

      return parseOrReport(NotificationRecipientListItemSchema.array(), rows)
    },

    async getRecipientStats(handle, notificationId) {
      const totalCount = await handle.notificationRecipient.count({
        where: {
          notificationId,
        },
      })
      const readCount = await handle.notificationRecipient.count({
        where: {
          notificationId,
          readAt: {
            not: null,
          },
        },
      })

      return {
        totalCount,
        readCount,
        unreadCount: totalCount - readCount,
      }
    },

    async findManyForUser(handle, userId, page) {
      const rows = await handle.notificationRecipient.findMany({
        ...pageQuery(page),
        where: {
          userId,
        },
        orderBy: [{ notification: { createdAt: "desc" } }, { id: "desc" }],
        include: {
          notification: {
            include: INCLUDE_ACTOR_GROUP,
          },
        },
      })

      const userNotifications = rows.map((row) => ({
        id: row.id,
        readAt: row.readAt,
        notification: mapInboxNotification(row.notification),
      }))

      return parseOrReport(UserNotificationSchema.array(), userNotifications)
    },

    async countUnreadForUser(handle, userId) {
      return await handle.notificationRecipient.count({
        where: {
          userId,
          readAt: null,
        },
      })
    },

    async markAsRead(handle, notificationId, userId) {
      const now = getCurrentUTC()

      const result = await handle.notificationRecipient.updateMany({
        where: {
          notificationId,
          userId,
          readAt: null,
        },
        data: {
          readAt: now,
        },
      })

      return result.count > 0
    },

    async markAllAsRead(handle, userId) {
      const now = getCurrentUTC()

      const result = await handle.notificationRecipient.updateMany({
        where: {
          userId,
          readAt: null,
        },
        data: {
          readAt: now,
        },
      })

      return result.count
    },
  }
}
