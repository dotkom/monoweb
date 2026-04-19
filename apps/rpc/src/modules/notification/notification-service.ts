import type EventEmitter from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import type { UserId } from "@dotkomonline/types"
import type { NotificationRepository } from "./notification-repository"
import type { Pageable } from "@dotkomonline/utils"
import type { UserRepository } from "../user/user-repository"
import type { AttendanceRepository } from "../event/attendance-repository"
import type {
  Notification,
  NotificationId,
  NotificationPayloadType,
  NotificationRecipient,
  NotificationRecipientId,
  NotificationType,
  NotificationWrite,
  UserNotification,
} from "./notification-types"

export interface NotificationService {
  findById(handle: DBHandle, notificationId: NotificationId): Promise<Notification | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Notification[]>
  retrieveIntendedRecipientIds(
    handle: DBHandle,
    notificationType: NotificationType,
    eventId?: string
  ): Promise<UserId[]>
  create(
    handle: DBHandle,
    recipientIds: UserId[],
    notificationType: NotificationType,
    title: string,
    shortDescription: string,
    actorGroupId?: string | null,
    payloadType?: NotificationPayloadType,
    payload?: string | null
  ): Promise<Notification>
  findManyByPayload(
    handle: DBHandle,
    payloadType: NotificationPayloadType,
    payload: string,
    page: Pageable
  ): Promise<Notification[]>
  update(
    handle: DBHandle,
    notificationId: NotificationId,
    notificationData: Partial<NotificationWrite>
  ): Promise<Notification>
  delete(handle: DBHandle, notificationId: NotificationId): Promise<boolean>

  addRecipients(handle: DBHandle, notificationId: NotificationId, recipientIds: UserId[]): Promise<void>
  removeRecipients(handle: DBHandle, notificationId: NotificationId, recipientIds: UserId[]): Promise<void>

  findRecipient(
    handle: DBHandle,
    recipientId: NotificationRecipientId,
    userId: UserId
  ): Promise<NotificationRecipient | null>
  findAllForUser(handle: DBHandle, userId: UserId, page: Pageable): Promise<UserNotification[]>
  getUnreadCountForUser(handle: DBHandle, userId: UserId): Promise<number>
  markAsRead(handle: DBHandle, notificationId: NotificationId, userId: UserId): Promise<boolean>
  markAllAsRead(handle: DBHandle, userId: UserId): Promise<boolean>
}

export function getNotificationService(
  notificationRepository: NotificationRepository,
  userRepository: UserRepository,
  attendanceRepository: AttendanceRepository,
  eventEmitter: EventEmitter
): NotificationService {
  return {
    async findById(handle, notificationId) {
      return await notificationRepository.findById(handle, notificationId)
    },

    async findMany(handle, page) {
      return await notificationRepository.findMany(handle, page)
    },

    async create(handle, recipientIds, notificationType, title, shortDescription, actorGroupId, payloadType, payload) {
      const notification = await notificationRepository.createWithRecipients(handle, {
        title,
        shortDescription,
        content: shortDescription ?? title,
        type: notificationType,
        payload: payload ?? null,
        payloadType: payloadType ?? "NONE",
        actorGroupId: actorGroupId ?? null,
        taskId: null,
        recipientIds,
      })
      for (const userId of recipientIds) {
        eventEmitter.emit("notification:new", { userId, notification })
      }
      return notification
    },

    async retrieveIntendedRecipientIds(handle, notificationType, eventId) {
      const eventAttendeeTypes: NotificationType[] = ["EVENT_REGISTRATION", "EVENT_REMINDER", "EVENT_UPDATE"]

      if (eventAttendeeTypes.includes(notificationType) && eventId) {
        const attendance = await attendanceRepository.findAttendanceByEventId(handle, eventId)
        return attendance?.attendees.map((a) => a.userId) ?? []
      }

      const users = await userRepository.findMany(handle, {}, { take: 10000 })
      return users.map((u) => u.id)
    },

    async findManyByPayload(handle, payloadType, payload, page) {
      return await notificationRepository.findManyByPayload(handle, payloadType, payload, page)
    },

    async update(handle, notificationId, notificationData) {
      return await notificationRepository.update(handle, notificationId, notificationData)
    },

    async delete(handle, notificationId) {
      return await notificationRepository.delete(handle, notificationId)
    },

    async addRecipients(handle, notificationId, recipientIds) {
      await notificationRepository.addRecipients(handle, notificationId, recipientIds)
    },

    async removeRecipients(handle, notificationId, recipientIds) {
      await notificationRepository.removeRecipients(handle, notificationId, recipientIds)
    },

    async findRecipient(handle, recipientId, userId) {
      return await notificationRepository.findRecipient(handle, recipientId, userId)
    },

    async findAllForUser(handle, userId, page) {
      return await notificationRepository.findAllForUser(handle, userId, page)
    },

    async getUnreadCountForUser(handle, userId) {
      return await notificationRepository.getUnreadCountForUser(handle, userId)
    },

    async markAsRead(handle, notificationId, userId) {
      return await notificationRepository.markAsRead(handle, notificationId, userId)
    },

    async markAllAsRead(handle, userId) {
      return await notificationRepository.markAllAsRead(handle, userId)
    },
  }
}
