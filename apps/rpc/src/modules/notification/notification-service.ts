import { type EventEmitter, on } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Pageable } from "@dotkomonline/utils"
import { InvalidArgumentError, NotFoundError } from "../../error"
import type { ArticleService } from "../article/article-service"
import type { EventService } from "../event/event-service"
import type { GroupId } from "../group/group"
import type { GroupService } from "../group/group-service"
import type { JobListingService } from "../job-listing/job-listing-service"
import type { OfflineService } from "../offline/offline-service"
import type { TaskId } from "../task/task"
import type { UserId } from "../user/user"
import type { UserService } from "../user/user-service"
import { NotificationGlobalLinkSchema, NotificationUpdateSchema } from "./notification"
import type {
  Notification,
  NotificationFilterQuery,
  NotificationGlobalLink,
  NotificationId,
  NotificationLink,
  NotificationManagement,
  NotificationRecipient,
  NotificationRecipientListItem,
  NotificationRecipientFilterQuery,
  NotificationRecipientSelection,
  NotificationRecipientSelectionPreview,
  NotificationRecipientStats,
  NotificationType,
  NotificationSource,
  NotificationUpdate,
  UserNotification,
} from "./notification"
import type { NotificationRecipientResolver } from "./notification-recipient-resolver"
import type { NotificationRepository } from "./notification-repository"

export interface NotificationSendInput {
  source: NotificationSource
  type: NotificationType
  title: string
  shortDescription: string
  content?: string
  link?: NotificationGlobalLink
  recipientSelection: NotificationRecipientSelection
  actorGroupId?: GroupId | null
  createdById?: UserId | null
  taskId?: TaskId | null
}

export interface NotificationSendResult {
  notification: NotificationManagement
  recipientCount: number
}

export interface NotificationSourceServices {
  eventService: Pick<EventService, "getEventById">
  articleService: Pick<ArticleService, "getBySlug">
  groupService: Pick<GroupService, "getBySlug">
  userService: Pick<UserService, "getById">
  offlineService: Pick<OfflineService, "getById">
  jobListingService: Pick<JobListingService, "getById">
}

export const NEW_NOTIFICATION_EVENT = "notification:new"

export interface NewNotificationEvent {
  userId: UserId
  userNotification: UserNotification
}

export interface NotificationService {
  /**
   * Create a notification and materialize its recipients from the given recipient selection.
   *
   * Recipients are a snapshot of who matched at send time. People who later join a targeted group or event are not
   * added automatically.
   */
  send(handle: DBHandle, input: NotificationSendInput): Promise<NotificationSendResult>
  /**
   * Resolve a recipient selection without writing anything, so the UI can show who would be notified.
   */
  previewRecipientSelection(
    handle: DBHandle,
    recipientSelection: NotificationRecipientSelection,
    notificationType: NotificationType,
    page: Pageable,
    search?: string
  ): Promise<NotificationRecipientSelectionPreview>

  findById(handle: DBHandle, notificationId: NotificationId): Promise<NotificationManagement | null>
  getById(handle: DBHandle, notificationId: NotificationId): Promise<NotificationManagement>
  findMany(handle: DBHandle, query: NotificationFilterQuery, page: Pageable): Promise<NotificationManagement[]>
  /**
   * Update a notification by its id.
   *
   * This mutates the live notification row. Inbox reads join that row, so recipients will see the new title and
   * content on the next fetch. Already-pushed subscription payloads are not rewritten.
   * The link payload is fixed when the notification is created and cannot be updated.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  update(handle: DBHandle, notificationId: NotificationId, data: NotificationUpdate): Promise<NotificationManagement>
  delete(handle: DBHandle, notificationId: NotificationId): Promise<void>

  addRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    recipientSelection: NotificationRecipientSelection
  ): Promise<number>
  removeRecipients(handle: DBHandle, notificationId: NotificationId, userIds: UserId[]): Promise<number>
  findRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    filters: NotificationRecipientFilterQuery,
    page: Pageable
  ): Promise<NotificationRecipientListItem[]>
  getRecipientStats(handle: DBHandle, notificationId: NotificationId): Promise<NotificationRecipientStats>

  findManyForUser(handle: DBHandle, userId: UserId, page: Pageable): Promise<UserNotification[]>
  countUnreadForUser(handle: DBHandle, userId: UserId): Promise<number>

  markAsRead(handle: DBHandle, notificationId: NotificationId, userId: UserId): Promise<boolean>
  markAllAsRead(handle: DBHandle, userId: UserId): Promise<number>

  subscribeToNewNotifications(userId: UserId, signal?: AbortSignal): AsyncIterable<UserNotification>
}

export function getNotificationService(
  notificationRepository: NotificationRepository,
  recipientResolver: NotificationRecipientResolver,
  sourceServices: NotificationSourceServices,
  eventEmitter: EventEmitter
): NotificationService {
  const logger = getLogger("notification-service")

  async function resolveNotificationLink(handle: DBHandle, input: NotificationSendInput): Promise<NotificationLink> {
    const source = input.source

    if (source.type === "GLOBAL") {
      const result = NotificationGlobalLinkSchema.safeParse(input.link ?? { type: "NONE" })

      if (!result.success) {
        throw new InvalidArgumentError("Global notifications can only have no link or a URL")
      }

      return result.data
    }

    if (input.link !== undefined && input.link.type !== "NONE") {
      throw new InvalidArgumentError("Notifications from a specific context have a fixed link")
    }

    switch (source.type) {
      case "EVENT": {
        const event = await sourceServices.eventService.getEventById(handle, source.eventId)

        return {
          type: "EVENT",
          eventId: event.id,
        }
      }
      case "ARTICLE": {
        const article = await sourceServices.articleService.getBySlug(handle, source.articleSlug)

        return {
          type: "ARTICLE",
          articleSlug: article.slug,
        }
      }
      case "GROUP": {
        const group = await sourceServices.groupService.getBySlug(handle, source.groupSlug)

        return {
          type: "GROUP",
          groupSlug: group.slug,
        }
      }
      case "USER": {
        const user = await sourceServices.userService.getById(handle, source.userId)

        return {
          type: "USER",
          userId: user.id,
        }
      }
      case "OFFLINE": {
        const offline = await sourceServices.offlineService.getById(handle, source.offlineId)

        return {
          type: "OFFLINE",
          offlineId: offline.id,
        }
      }
      case "JOB_LISTING": {
        const jobListing = await sourceServices.jobListingService.getById(handle, source.jobListingId)

        return {
          type: "JOB_LISTING",
          jobListingId: jobListing.id,
        }
      }
    }
  }

  function toInboxNotification(notification: NotificationManagement): Notification {
    const { initialRecipientSelection: _initialRecipientSelection, ...inboxNotification } = notification

    return inboxNotification
  }

  function emitNewNotifications(recipients: NotificationRecipient[], notification: Notification): void {
    for (const recipient of recipients) {
      emitNewNotification(recipient.userId, {
        id: recipient.id,
        readAt: recipient.readAt,
        notification,
      })
    }
  }

  function mergeRecipientSelectionExclusions(
    initialRecipientSelection: NotificationRecipientSelection | null,
    incomingRecipientSelection: NotificationRecipientSelection
  ): NotificationRecipientSelection {
    const initiallyExcludedUserIds = initialRecipientSelection?.excludedUserIds ?? []
    const excludedUserIds = [...new Set([...initiallyExcludedUserIds, ...incomingRecipientSelection.excludedUserIds])]

    return {
      ...incomingRecipientSelection,
      excludedUserIds,
    }
  }

  function emitNewNotification(userId: UserId, userNotification: UserNotification): void {
    const event: NewNotificationEvent = { userId, userNotification }

    eventEmitter.emit(NEW_NOTIFICATION_EVENT, event)
  }

  return {
    async send(handle, input) {
      const link = await resolveNotificationLink(handle, input)

      const recipientResolution = await recipientResolver.resolve(handle, input.recipientSelection, input.type)

      const notification = await notificationRepository.create(handle, {
        type: input.type,
        title: input.title,
        shortDescription: input.shortDescription,
        content: input.content ?? input.shortDescription,
        link,
        initialRecipientSelection: input.recipientSelection,
        actorGroupId: input.actorGroupId ?? null,
        createdById: input.createdById ?? null,
        taskId: input.taskId ?? null,
      })

      const recipientUserIds = recipientResolution.recipients.map((recipient) => recipient.userId)
      const recipients = await notificationRepository.addRecipients(handle, notification.id, recipientUserIds)

      logger.info(
        "Sent Notification(ID=%s, Type=%s) to %d recipients",
        notification.id,
        notification.type,
        recipients.length
      )

      const inboxNotification = toInboxNotification(notification)

      emitNewNotifications(recipients, inboxNotification)

      return {
        notification,
        recipientCount: recipients.length,
      }
    },

    async previewRecipientSelection(handle, recipientSelection, notificationType, page, search) {
      return await recipientResolver.preview(handle, recipientSelection, notificationType, page, search)
    },

    async findById(handle, notificationId) {
      return await notificationRepository.findById(handle, notificationId)
    },

    async getById(handle, notificationId) {
      const notification = await this.findById(handle, notificationId)

      if (notification === null) {
        throw new NotFoundError(`Notification(ID=${notificationId}) not found`)
      }

      return notification
    },

    async findMany(handle, query, page) {
      return await notificationRepository.findMany(handle, query, page)
    },

    async update(handle, notificationId, data) {
      const update = NotificationUpdateSchema.safeParse(data)

      if (!update.success) {
        throw new InvalidArgumentError("Invalid notification update. The link target cannot be changed.")
      }

      await this.getById(handle, notificationId)

      return await notificationRepository.update(handle, notificationId, update.data)
    },

    async delete(handle, notificationId) {
      await this.getById(handle, notificationId)

      await notificationRepository.delete(handle, notificationId)
    },

    async addRecipients(handle, notificationId, recipientSelection) {
      const notification = await this.getById(handle, notificationId)
      const recipientSelectionWithInitialExclusions = mergeRecipientSelectionExclusions(
        notification.initialRecipientSelection,
        recipientSelection
      )
      const recipientResolution = await recipientResolver.resolve(
        handle,
        recipientSelectionWithInitialExclusions,
        notification.type
      )

      const recipientUserIds = recipientResolution.recipients.map((recipient) => recipient.userId)
      const addedRecipients = await notificationRepository.addRecipients(handle, notificationId, recipientUserIds)

      logger.info("Added %d recipients to Notification(ID=%s)", addedRecipients.length, notificationId)

      const inboxNotification = toInboxNotification(notification)

      emitNewNotifications(addedRecipients, inboxNotification)

      return addedRecipients.length
    },

    async removeRecipients(handle, notificationId, userIds) {
      await this.getById(handle, notificationId)

      return await notificationRepository.removeRecipients(handle, notificationId, userIds)
    },

    async findRecipients(handle, notificationId, filters, page) {
      await this.getById(handle, notificationId)

      return await notificationRepository.findRecipients(handle, notificationId, filters, page)
    },

    async getRecipientStats(handle, notificationId) {
      await this.getById(handle, notificationId)

      return await notificationRepository.getRecipientStats(handle, notificationId)
    },

    async findManyForUser(handle, userId, page) {
      return await notificationRepository.findManyForUser(handle, userId, page)
    },

    async countUnreadForUser(handle, userId) {
      return await notificationRepository.countUnreadForUser(handle, userId)
    },

    async markAsRead(handle, notificationId, userId) {
      return await notificationRepository.markAsRead(handle, notificationId, userId)
    },

    async markAllAsRead(handle, userId) {
      return await notificationRepository.markAllAsRead(handle, userId)
    },

    async *subscribeToNewNotifications(userId, signal) {
      for await (const [event] of on(eventEmitter, NEW_NOTIFICATION_EVENT, { signal })) {
        const newNotificationEvent = event as NewNotificationEvent

        if (newNotificationEvent.userId !== userId) {
          continue
        }

        yield newNotificationEvent.userNotification
      }
    },
  }
}
