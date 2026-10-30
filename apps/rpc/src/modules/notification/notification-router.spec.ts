import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it, vi } from "vitest"
import { mock, mockDeep } from "vitest-mock-extended"
import type { Rule, RuleContext } from "../../authorization"
import { ForbiddenError } from "../../error"
import type { Principal, TRPCContext } from "../../trpc"
import type { Event } from "../event/event"
import type { Group, GroupRoleType } from "../group/group"
import { type NotificationManagement, NotificationCreateSchema, type NotificationSource } from "./notification"
import { notificationRouter } from "./notification-router"

const timestamp = new Date("2026-10-27T12:00:00Z")
const actorGroup: Group = {
  slug: "arrkom",
  abbreviation: "Arrkom",
  name: null,
  preferredDisplayName: "ABBREVIATION",
  description: "",
  shortDescription: null,
  imageUrl: null,
  email: null,
  contactUrl: null,
  slackUrl: null,
  showLeaderAsContact: false,
  createdAt: timestamp,
  deactivatedAt: null,
  workspaceGroupId: null,
  memberVisibility: "ALL_MEMBERS",
  recruitmentMethod: "NONE",
  type: "COMMITTEE",
  roles: [],
}
const notification: NotificationManagement = {
  id: "notification-1",
  createdAt: timestamp,
  updatedAt: timestamp,
  status: "SENT",
  sentAt: timestamp,
  title: "Message",
  shortDescription: "An update",
  content: "<p>An update</p>",
  type: "BROADCAST",
  link: { type: "EVENT", eventId: "event-1" },
  actorGroupId: actorGroup.slug,
  actorGroup,
  createdById: "sender-1",
  lastUpdatedById: null,
  taskId: null,
  initialRecipientSelection: null,
  draftRecipientSelection: null,
}
const message = {
  title: notification.title,
  shortDescription: notification.shortDescription,
  type: "BROADCAST" as const,
  actorGroupId: actorGroup.slug,
  recipientSelection: {
    rules: [{ type: "GROUP_MEMBERS" as const, groupSlug: "arrkom" }],
  },
}
const eventMessage = {
  ...message,
  source: { type: "EVENT" as const, eventId: "event-1" },
  recipientSelection: {
    rules: [{ type: "EVENT_ATTENDEES" as const, attendanceId: "attendance-1" }],
  },
}

function createCaller(groupSlug = "arrkom", role: GroupRoleType = "COSMETIC") {
  const principal: Principal = {
    subject: "sender-1",
    affiliations: new Map([[groupSlug, new Set([role])]]),
    scopes: new Set(),
  }
  const databaseHandle = mockDeep<DBHandle>()
  databaseHandle.auditTransaction.create.mockResolvedValue(mock({ id: "audit-1" }))
  const event = mock<Event>({ id: "event-1", attendanceId: "attendance-1" })
  event.hostingGroups = [actorGroup]
  const notificationService = {
    send: vi.fn().mockResolvedValue({ notification, recipientCount: 1 }),
    getById: vi.fn().mockResolvedValue(notification),
    update: vi.fn().mockResolvedValue(notification),
  }
  const context = {
    principal,
    prisma: {
      $transaction: async (callback: (handle: DBHandle) => Promise<unknown>) => callback(databaseHandle),
    },
    notificationService,
    groupService: { getBySlug: vi.fn(async (_handle, slug: string) => ({ ...actorGroup, slug })) },
    eventService: {
      getEventById: vi.fn().mockResolvedValue(event),
      getByAttendanceId: vi.fn().mockResolvedValue(event),
    },
    addAuthorizationGuard: async (rule: Rule<unknown>, input: unknown) => {
      const ruleContext: RuleContext<unknown> = {
        ctx: context,
        principal,
        input,
        evaluate: (childRule, childContext) => childRule.evaluate(childContext),
      }

      if (!(await rule.evaluate(ruleContext))) {
        throw new ForbiddenError("Not authorized")
      }
    },
  } as unknown as TRPCContext

  return { caller: notificationRouter.createCaller(context), notificationService, event }
}

describe("notification creation payloads", () => {
  it.each([
    { type: "NONE" as const },
    { type: "URL" as const, url: "https://example.com" },
  ])("allows $type for global messages", async (link) => {
    const { caller, notificationService } = createCaller()

    await caller.create({ ...message, link })

    expect(notificationService.send).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ link }))
  })

  it("defaults global messages to no link", async () => {
    const { caller, notificationService } = createCaller()

    await caller.create(message)

    expect(notificationService.send).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ link: { type: "NONE" } })
    )
  })

  it.each([
    { type: "EVENT", eventId: "event-1" },
    { type: "GROUP", groupSlug: "arrkom" },
    { type: "ARTICLE", articleSlug: "article-1" },
    { type: "USER", userId: "user-1" },
    { type: "OFFLINE", offlineId: "offline-1" },
    { type: "JOB_LISTING", jobListingId: "job-1" },
  ])("rejects choosing $type as a global payload", (link) => {
    expect(NotificationCreateSchema.safeParse({ ...message, link }).success).toBe(false)
  })

  it("forwards the authorized creation context to the service", async () => {
    const { caller, notificationService } = createCaller()

    await caller.create(eventMessage)

    expect(notificationService.send).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ source: { type: "EVENT", eventId: "event-1" }, link: { type: "NONE" } })
    )
  })

  it("rejects an event the sender does not organize", async () => {
    const { caller, event, notificationService } = createCaller()
    event.hostingGroups = [{ ...actorGroup, slug: "bedkom" }]

    await expect(caller.create(eventMessage)).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(notificationService.send).not.toHaveBeenCalled()
  })
})

describe("notification source authorization", () => {
  const resourceSources = [
    { type: "EVENT", eventId: "event-1" },
    { type: "ARTICLE", articleSlug: "article-1" },
    { type: "GROUP", groupSlug: "arrkom" },
    { type: "USER", userId: "user-1" },
    { type: "OFFLINE", offlineId: "offline-1" },
    { type: "JOB_LISTING", jobListingId: "job-1" },
  ] satisfies NotificationSource[]

  it.each(resourceSources)("supports the $type creation context", async (source) => {
    const { caller, notificationService } = createCaller("dotkom")

    await caller.create({ ...message, source })

    expect(notificationService.send).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ source }))
  })

  it.each([
    { source: { type: "GROUP", groupSlug: "bedkom" }, groupSlug: "arrkom", role: "COSMETIC" },
    { source: { type: "USER", userId: "user-1" }, groupSlug: "arrkom", role: "COSMETIC" },
    { source: { type: "OFFLINE", offlineId: "offline-1" }, groupSlug: "redaksjonen", role: "COSMETIC" },
    { source: { type: "JOB_LISTING", jobListingId: "job-1" }, groupSlug: "arrkom", role: "COSMETIC" },
  ] satisfies {
    source: NotificationSource
    groupSlug: string
    role: GroupRoleType
  }[])("rejects $source.type creation without the required source permission", async ({ source, groupSlug, role }) => {
    const { caller, notificationService } = createCaller(groupSlug, role)

    await expect(
      caller.create({
        ...message,
        source,
        actorGroupId: groupSlug,
        recipientSelection: { rules: [{ type: "GROUP_MEMBERS", groupSlug }] },
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(notificationService.send).not.toHaveBeenCalled()
  })

  it.each([
    { source: { type: "ARTICLE", articleSlug: "article-1" }, groupSlug: "arrkom", role: "COSMETIC" },
    { source: { type: "GROUP", groupSlug: "arrkom" }, groupSlug: "arrkom", role: "COSMETIC" },
    { source: { type: "OFFLINE", offlineId: "offline-1" }, groupSlug: "redaksjonen", role: "LEADER" },
    { source: { type: "JOB_LISTING", jobListingId: "job-1" }, groupSlug: "bedkom", role: "COSMETIC" },
  ] satisfies {
    source: NotificationSource
    groupSlug: string
    role: GroupRoleType
  }[])("preserves the existing $source.type management permissions", async ({ source, groupSlug, role }) => {
    const { caller, notificationService } = createCaller(groupSlug, role)

    await caller.create({
      ...message,
      source,
      actorGroupId: groupSlug,
      recipientSelection: { rules: [{ type: "GROUP_MEMBERS", groupSlug }] },
    })

    expect(notificationService.send).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ source }))
  })
})

describe("immutable notification payloads", () => {
  it.each(["arrkom", "dotkom", "hs"])("rejects payload edits for %s", async (groupSlug) => {
    const { caller, notificationService } = createCaller(groupSlug)
    const input = { title: "Updated", link: { type: "URL", url: "https://example.com" } }

    await expect(caller.edit({ id: notification.id, input })).rejects.toMatchObject({ code: "BAD_REQUEST" })
    expect(notificationService.update).not.toHaveBeenCalled()
  })

  it.each(["arrkom", "dotkom"])("still allows content edits for %s", async (groupSlug) => {
    const { caller, notificationService } = createCaller(groupSlug)

    await caller.edit({ id: notification.id, input: { title: "Updated" } })

    expect(notificationService.update).toHaveBeenCalledWith(expect.anything(), notification.id, {
      title: "Updated",
      lastUpdatedById: "sender-1",
    })
  })
})
