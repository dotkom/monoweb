import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { beforeEach, describe, expect, it } from "vitest"
import { mock, mockDeep, mockReset } from "vitest-mock-extended"
import { InvalidArgumentError, NotFoundError } from "../../error"
import type { NotificationLink, NotificationManagement, NotificationSource, NotificationType } from "./notification"
import type { NotificationRecipientResolver } from "./notification-recipient-resolver"
import type { NotificationRepository } from "./notification-repository"
import {
  getNotificationService,
  type NotificationSendInput,
  type NotificationSourceServices,
} from "./notification-service"

describe("notification payload behavior", () => {
  const databaseHandle = mockDeep<DBHandle>()
  const repository = mock<NotificationRepository>()
  const recipientResolver = mock<NotificationRecipientResolver>()
  const sourceServices = mockDeep<NotificationSourceServices>()
  const service = getNotificationService(repository, recipientResolver, sourceServices, new EventEmitter())
  const timestamp = new Date("2026-10-27T12:00:00Z")
  const notification: NotificationManagement = {
    id: "notification-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    title: "Message",
    shortDescription: "Description",
    content: "Content",
    type: "BROADCAST",
    link: { type: "NONE" },
    actorGroupId: null,
    actorGroup: null,
    createdById: null,
    lastUpdatedById: null,
    taskId: null,
    initialRecipientSelection: null,
  }
  const message: Omit<NotificationSendInput, "source"> = {
    type: "BROADCAST",
    title: "Message",
    shortDescription: "Description",
    recipientSelection: {
      rules: [{ type: "GROUP_MEMBERS", groupSlug: "arrkom", includeFormerMembers: false }],
      excludedUserIds: [],
    },
  }
  const resourceCases = [
    { source: { type: "EVENT", eventId: "event-1" }, notificationType: "NEW_EVENT" },
    { source: { type: "ARTICLE", articleSlug: "article-1" }, notificationType: "NEW_ARTICLE" },
    { source: { type: "GROUP", groupSlug: "group-1" }, notificationType: "NEW_INTEREST_GROUP" },
    { source: { type: "USER", userId: "user-1" }, notificationType: "NEW_MARK" },
    { source: { type: "OFFLINE", offlineId: "offline-1" }, notificationType: "NEW_OFFLINE" },
    { source: { type: "JOB_LISTING", jobListingId: "job-1" }, notificationType: "NEW_JOB_LISTING" },
  ] satisfies { source: Exclude<NotificationSource, { type: "GLOBAL" }>; notificationType: NotificationType }[]

  beforeEach(() => {
    mockReset(repository)
    mockReset(recipientResolver)
    mockReset(sourceServices)
    repository.create.mockImplementation(async (_handle, data) => ({ ...notification, ...data }))
    repository.addRecipients.mockResolvedValue([])
    repository.findById.mockResolvedValue(notification)
    repository.update.mockResolvedValue(notification)
    recipientResolver.resolve.mockResolvedValue({
      recipients: [],
      matchCount: 0,
      duplicateCount: 0,
      excludedCount: 0,
      optedOutCount: 0,
    })
    sourceServices.eventService.getEventById.mockResolvedValue(mock({ id: "event-1", attendanceId: null }))
    sourceServices.articleService.getBySlug.mockResolvedValue(mock({ slug: "article-1" }))
    sourceServices.groupService.getBySlug.mockResolvedValue(mock({ slug: "group-1" }))
    sourceServices.userService.getById.mockResolvedValue(mock({ id: "user-1" }))
    sourceServices.offlineService.getById.mockResolvedValue(mock({ id: "offline-1" }))
    sourceServices.jobListingService.getById.mockResolvedValue(mock({ id: "job-1" }))
  })

  describe("notification payload construction", () => {
    it.each([
      undefined,
      { type: "NONE" as const },
      { type: "URL" as const, url: "https://example.com" },
    ])("allows no link or a URL for global notifications: %j", async (link) => {
      const result = await service.send(databaseHandle, { ...message, source: { type: "GLOBAL" }, link })

      expect(result.notification.link).toEqual(link ?? { type: "NONE" })
    })

    it.each(resourceCases)("derives the fixed $source.type payload in the service", async ({
      source,
      notificationType,
    }) => {
      const result = await service.send(databaseHandle, { ...message, source, type: notificationType })

      expect(repository.create).toHaveBeenCalledWith(databaseHandle, expect.objectContaining({ link: source }))
      expect(result.notification.link).toEqual(source)
    })

    it.each(resourceCases)("rejects link overrides for $source.type before any writes", async ({ source }) => {
      await expect(
        service.send(databaseHandle, { ...message, source, link: { type: "URL", url: "https://example.com" } })
      ).rejects.toBeInstanceOf(InvalidArgumentError)
      expect(repository.create).not.toHaveBeenCalled()
      expect(recipientResolver.resolve).not.toHaveBeenCalled()
    })

    it.each(resourceCases)("rejects missing $source.type resources before any writes", async ({ source }) => {
      const missingResource = new NotFoundError("Missing resource")
      sourceServices.eventService.getEventById.mockRejectedValue(missingResource)
      sourceServices.articleService.getBySlug.mockRejectedValue(missingResource)
      sourceServices.groupService.getBySlug.mockRejectedValue(missingResource)
      sourceServices.userService.getById.mockRejectedValue(missingResource)
      sourceServices.offlineService.getById.mockRejectedValue(missingResource)
      sourceServices.jobListingService.getById.mockRejectedValue(missingResource)

      await expect(service.send(databaseHandle, { ...message, source })).rejects.toBe(missingResource)
      expect(repository.create).not.toHaveBeenCalled()
      expect(recipientResolver.resolve).not.toHaveBeenCalled()
    })

    it.each(resourceCases)("rejects $source.type payloads smuggled into global service calls", async ({ source }) => {
      const input = { ...message, source: { type: "GLOBAL" }, link: source } as unknown as NotificationSendInput

      await expect(service.send(databaseHandle, input)).rejects.toBeInstanceOf(InvalidArgumentError)
      expect(repository.create).not.toHaveBeenCalled()
    })

    it("allows event announcements to target groups even when the event has no attendance", async () => {
      await service.send(databaseHandle, { ...message, source: { type: "EVENT", eventId: "event-1" } })

      expect(recipientResolver.resolve).toHaveBeenCalledWith(databaseHandle, message.recipientSelection, message.type)
    })
  })

  describe("payload immutability in the service", () => {
    const links: NotificationLink[] = [
      { type: "NONE" },
      { type: "URL", url: "https://example.com" },
      ...resourceCases.map(({ source }) => source),
    ]

    it.each(links)("rejects attempts to change a payload to $type", async (link) => {
      const update = { title: "Updated", lastUpdatedById: "sender-1", link }

      await expect(service.update(databaseHandle, notification.id, update)).rejects.toBeInstanceOf(InvalidArgumentError)
      expect(repository.update).not.toHaveBeenCalled()
    })

    it("allows content updates", async () => {
      const update = { title: "Updated", lastUpdatedById: "sender-1" }

      await service.update(databaseHandle, notification.id, update)

      expect(repository.update).toHaveBeenCalledWith(databaseHandle, notification.id, update)
    })
  })
})
