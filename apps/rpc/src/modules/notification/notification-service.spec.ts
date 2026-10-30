import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { mock, mockDeep, mockReset } from "vitest-mock-extended"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError } from "../../error"
import { NotificationDraftCreateSchema } from "./notification"
import type { NotificationLink, NotificationManagement, NotificationSource, NotificationType } from "./notification"
import type { NotificationRecipientResolver } from "./notification-recipient-resolver"
import type { NotificationRepository } from "./notification-repository"
import type { NotificationSourceServices } from "./notification-source-resolver"
import { NEW_NOTIFICATION_EVENT, getNotificationService, type NotificationSendInput } from "./notification-service"

describe("notification payload behavior", () => {
  const databaseHandle = mockDeep<DBHandle>()
  const repository = mock<NotificationRepository>()
  const recipientResolver = mock<NotificationRecipientResolver>()
  const sourceServices = mockDeep<NotificationSourceServices>()
  const eventEmitter = new EventEmitter()
  const service = getNotificationService(repository, recipientResolver, sourceServices, eventEmitter)
  const timestamp = new Date("2026-10-27T12:00:00Z")
  const notification: NotificationManagement = {
    id: "notification-1",
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "SENT",
    sentAt: timestamp,
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
    draftRecipientSelection: null,
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
    eventEmitter.removeAllListeners()
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

  describe("notification drafts", () => {
    it("creates an incomplete draft without resolving or notifying recipients", async () => {
      const listener = vi.fn()
      eventEmitter.on(NEW_NOTIFICATION_EVENT, listener)
      const input = NotificationDraftCreateSchema.parse({ title: "Draft", type: "BROADCAST", actorGroupId: "arrkom" })

      const result = await service.createDraft(databaseHandle, { ...input, createdById: "sender-1" })

      expect(result).toMatchObject({ status: "DRAFT", sentAt: null, content: "", shortDescription: "" })
      expect(repository.create).toHaveBeenCalledWith(
        databaseHandle,
        expect.objectContaining({ initialRecipientSelection: null, draftRecipientSelection: null })
      )
      expect(recipientResolver.resolve).not.toHaveBeenCalled()
      expect(repository.addRecipients).not.toHaveBeenCalled()
      expect(listener).not.toHaveBeenCalled()
    })

    it.each(resourceCases)("creates $source.type drafts with their fixed payload", async ({ source }) => {
      const input = NotificationDraftCreateSchema.parse({
        title: "Draft",
        type: "BROADCAST",
        actorGroupId: "arrkom",
        source,
      })

      const result = await service.createDraft(databaseHandle, { ...input, createdById: "sender-1" })

      expect(result.link).toEqual(source)
      expect(result.status).toBe("DRAFT")
      expect(repository.addRecipients).not.toHaveBeenCalled()
    })

    it("prefills an event draft with attendance rules without resolving them", async () => {
      sourceServices.eventService.getEventById.mockResolvedValue(mock({ id: "event-1", attendanceId: "attendance-1" }))
      const input = NotificationDraftCreateSchema.parse({
        title: "Draft",
        type: "BROADCAST",
        actorGroupId: "arrkom",
        source: { type: "EVENT", eventId: "event-1" },
      })

      const result = await service.createDraft(databaseHandle, { ...input, createdById: "sender-1" })

      expect(result.draftRecipientSelection).toEqual({
        rules: [
          {
            type: "EVENT_ATTENDEES",
            attendanceId: "attendance-1",
            reservationStatus: "RESERVED",
            paymentStatus: "ALL",
          },
        ],
        excludedUserIds: [],
      })
      expect(recipientResolver.resolve).not.toHaveBeenCalled()
      expect(sourceServices.eventService.getEventById).toHaveBeenCalledExactlyOnceWith(databaseHandle, "event-1")
    })

    it("saves recipient rules without delivering anything", async () => {
      repository.saveDraftRecipients.mockResolvedValue({
        ...notification,
        status: "DRAFT",
        draftRecipientSelection: message.recipientSelection,
      })

      await service.saveDraftRecipients(databaseHandle, notification.id, message.recipientSelection, "sender-1")

      expect(repository.saveDraftRecipients).toHaveBeenCalledWith(
        databaseHandle,
        notification.id,
        message.recipientSelection,
        "sender-1"
      )
      expect(recipientResolver.resolve).not.toHaveBeenCalled()
      expect(repository.addRecipients).not.toHaveBeenCalled()
    })

    it("rejects editing recipient rules after sending", async () => {
      repository.saveDraftRecipients.mockResolvedValue(null)

      await expect(
        service.saveDraftRecipients(databaseHandle, notification.id, message.recipientSelection, "sender-1")
      ).rejects.toBeInstanceOf(FailedPreconditionError)
    })
  })

  describe("publishing a draft", () => {
    const draft: NotificationManagement = {
      ...notification,
      status: "DRAFT",
      sentAt: null,
      draftRecipientSelection: message.recipientSelection,
    }

    beforeEach(() => {
      repository.findById.mockResolvedValue(draft)
      repository.publishDraft.mockResolvedValue(notification)
      recipientResolver.resolve.mockResolvedValue({
        recipients: [{ userId: "new-member", sourceLabels: ["Group"], sourceRuleIndexes: [0] }],
        matchCount: 1,
        duplicateCount: 0,
        excludedCount: 0,
        optedOutCount: 0,
      })
      repository.addRecipients.mockResolvedValue([
        { id: "recipient-1", userId: "new-member", notificationId: notification.id, readAt: null },
      ])
    })

    it("resolves the saved rules at send time and then publishes the recipient snapshot", async () => {
      const listener = vi.fn()
      eventEmitter.on(NEW_NOTIFICATION_EVENT, listener)

      const result = await service.sendDraft(databaseHandle, draft.id, timestamp, "sender-1")

      expect(recipientResolver.resolve).toHaveBeenCalledWith(databaseHandle, message.recipientSelection, draft.type)
      expect(repository.publishDraft).toHaveBeenCalledWith(
        databaseHandle,
        draft.id,
        expect.objectContaining({
          expectedUpdatedAt: timestamp,
          recipientSelection: message.recipientSelection,
          sentAt: expect.any(Date),
          updatedById: "sender-1",
        })
      )
      expect(repository.addRecipients).toHaveBeenCalledWith(databaseHandle, draft.id, ["new-member"])
      expect(listener).toHaveBeenCalledOnce()
      expect(result.recipientCount).toBe(1)
    })

    it("does not send an incomplete draft", async () => {
      repository.findById.mockResolvedValue({ ...draft, shortDescription: "" })

      await expect(service.sendDraft(databaseHandle, draft.id, timestamp, "sender-1")).rejects.toBeInstanceOf(
        InvalidArgumentError
      )
      expect(repository.publishDraft).not.toHaveBeenCalled()
    })

    it("does not send a draft without saved recipient rules", async () => {
      repository.findById.mockResolvedValue({ ...draft, draftRecipientSelection: null })

      await expect(service.sendDraft(databaseHandle, draft.id, timestamp, "sender-1")).rejects.toBeInstanceOf(
        InvalidArgumentError
      )
      expect(repository.publishDraft).not.toHaveBeenCalled()
    })

    it("keeps drafts unsent when the current rules match nobody", async () => {
      recipientResolver.resolve.mockResolvedValue({
        recipients: [],
        matchCount: 0,
        duplicateCount: 0,
        excludedCount: 0,
        optedOutCount: 0,
      })

      await expect(service.sendDraft(databaseHandle, draft.id, timestamp, "sender-1")).rejects.toBeInstanceOf(
        InvalidArgumentError
      )
      expect(repository.publishDraft).not.toHaveBeenCalled()
    })

    it("rejects a stale content version", async () => {
      await expect(service.sendDraft(databaseHandle, draft.id, new Date(0), "sender-1")).rejects.toBeInstanceOf(
        FailedPreconditionError
      )
      expect(recipientResolver.resolve).not.toHaveBeenCalled()
    })

    it("allows only one of two concurrent sends to create recipients", async () => {
      repository.publishDraft.mockResolvedValueOnce(notification).mockResolvedValueOnce(null)

      const results = await Promise.allSettled([
        service.sendDraft(databaseHandle, draft.id, timestamp, "sender-1"),
        service.sendDraft(databaseHandle, draft.id, timestamp, "sender-1"),
      ])

      expect(results.map((result) => result.status).sort()).toEqual(["fulfilled", "rejected"])
      expect(repository.addRecipients).toHaveBeenCalledOnce()
    })

    it("rejects sending an already sent notification", async () => {
      repository.findById.mockResolvedValue(notification)

      await expect(service.sendDraft(databaseHandle, draft.id, timestamp, "sender-1")).rejects.toBeInstanceOf(
        FailedPreconditionError
      )
      expect(repository.addRecipients).not.toHaveBeenCalled()
    })

    it("prevents Send til flere from bypassing draft publication", async () => {
      await expect(service.addRecipients(databaseHandle, draft.id, message.recipientSelection)).rejects.toBeInstanceOf(
        FailedPreconditionError
      )
      expect(repository.addRecipients).not.toHaveBeenCalled()
    })
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
