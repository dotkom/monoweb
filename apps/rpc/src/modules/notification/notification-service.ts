import type EventEmitter from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import type { UserId } from "../user/user"
import type { NotificationPermissionsRepository } from "../user/notification-permissions-repository"
import type { NotificationRepository } from "./notification-repository"
import type { Pageable } from "@dotkomonline/utils"
import type { AttendanceRepository } from "../event/attendance-repository"
import {
  getNotificationPermissionField,
  shouldBypassNotificationPreferences,
} from "./notification-preferences"
import type {
  Notification,
  NotificationId,
  NotificationPayloadType,
  NotificationRecipient,
  NotificationRecipientId,
  NotificationType,
  NotificationWrite,
  UserNotification,
} from "./notification"

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
    payload?: string | null,
    createdById?: UserId | null
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
  findRecipientsByNotificationId(
    handle: DBHandle,
    notificationId: NotificationId
  ): Promise<Array<{ id: string; readAt: Date | null; userId: string; user: { id: string; name: string | null } }>>
}

export function getNotificationService(
  notificationRepository: NotificationRepository,
  attendanceRepository: AttendanceRepository,
  notificationPermissionsRepository: NotificationPermissionsRepository,
  eventEmitter: EventEmitter
): NotificationService {
  return {
    async findById(handle, notificationId) {
      return await notificationRepository.findById(handle, notificationId)
    },

    async findMany(handle, page) {
      return await notificationRepository.findMany(handle, page)
    },

    async create(
      handle,
      recipientIds,
      notificationType,
      title,
      shortDescription,
      actorGroupId,
      payloadType,
      payload,
      createdById
    ) {
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
        createdById: createdById ?? null,
      })
      for (const userId of recipientIds) {
        eventEmitter.emit("notification:new", { userId, notification })
      }
      return notification
    },

    async retrieveIntendedRecipientIds(handle, notificationType, eventId) {
      if (shouldBypassNotificationPreferences(notificationType)) {
        return notificationPermissionsRepository.findAllUserIds(handle)
      }

      const permissionField = getNotificationPermissionField(notificationType)
      const eventAttendeeTypes: NotificationType[] = ["EVENT_REMINDER", "EVENT_UPDATE"]

      if (eventAttendeeTypes.includes(notificationType) && eventId) {
        const attendance = await attendanceRepository.findAttendanceByEventId(handle, eventId)
        const candidateIds = attendance?.attendees.map((attendee) => attendee.userId) ?? []

        return notificationPermissionsRepository.filterUserIdsByPreference(handle, candidateIds, permissionField)
      }

      return notificationPermissionsRepository.findUserIdsWithPreferenceEnabled(handle, permissionField)
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
      const addedRecipients = await notificationRepository.addRecipients(handle, notificationId, recipientIds)

      if (addedRecipients.length === 0) {
        return
      }

      const notification = await notificationRepository.findById(handle, notificationId)

      if (notification === null) {
        return
      }

      for (const recipient of addedRecipients) {
        eventEmitter.emit("notification:new", { userId: recipient.userId, notification })
      }
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

    async findRecipientsByNotificationId(handle, notificationId) {
      return await notificationRepository.findRecipientsByNotificationId(handle, notificationId)
    },
  }
}
