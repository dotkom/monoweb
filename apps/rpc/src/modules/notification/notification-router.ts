import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isCommitteeMember } from "../../authorization"
import { ForbiddenError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { type TRPCContext, procedure, t } from "../../trpc"
import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import type { DBHandle } from "@dotkomonline/db"
import type { GroupId } from "../group/group"
import {
  type Notification,
  type NotificationAudience,
  NotificationAudiencePreviewSchema,
  NotificationAudienceSchema,
  NotificationCreateSchema,
  NotificationFilterQuerySchema,
  NotificationManagementSchema,
  NotificationRecipientListItemSchema,
  NotificationRecipientStatsSchema,
  NotificationSchema,
  NotificationTypeSchema,
  NotificationUpdateSchema,
  UserNotificationSchema,
} from "./notification"

type AuthenticatedContext = TRPCContext & {
  principal: NonNullable<TRPCContext["principal"]>
  handle: DBHandle
}

function assertCanActAsGroup(ctx: AuthenticatedContext, groupSlug: GroupId): void {
  const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [groupSlug])

  if (allowedGroups.size === 0) {
    throw new ForbiddenError(
      `User(ID=${ctx.principal.subject}) is not authorized to act as Group(Slug=${groupSlug}) for notifications`
    )
  }
}

function assertCanManageNotification(ctx: AuthenticatedContext, notification: Notification): void {
  if (notification.actorGroupId === null) {
    if (!ctx.authorizationService.isAdministrator(ctx.principal.affiliations)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to manage system Notification(ID=${notification.id})`
      )
    }

    return
  }

  assertCanActAsGroup(ctx, notification.actorGroupId)
}

/**
 * Checks each audience rule against the caller:
 * - `ALL_USERS` is administrator-only.
 * - `GROUP_MEMBERS` requires affiliation with that group.
 * - `EVENT_ATTENDEES` requires affiliation with one of the event's hosting groups.
 * - `USERS` is allowed for any committee member.
 *
 * NOTE: This method expects a prior committee member check.
 */
async function assertCanTargetAudience(ctx: AuthenticatedContext, audience: NotificationAudience): Promise<void> {
  const isAdministrator = ctx.authorizationService.isAdministrator(ctx.principal.affiliations)

  for (const rule of audience.rules) {
    switch (rule.type) {
      case "ALL_USERS": {
        if (!isAdministrator) {
          throw new ForbiddenError(`User(ID=${ctx.principal.subject}) is not authorized to notify all users`)
        }

        break
      }

      case "USERS": {
        break
      }

      case "GROUP_MEMBERS": {
        assertCanActAsGroup(ctx, rule.groupSlug)

        break
      }

      case "EVENT_ATTENDEES": {
        const event = await ctx.eventService.getByAttendanceId(ctx.handle, rule.attendanceId)
        const hostingGroupSlugs = event.hostingGroups.map((group) => group.slug)

        const canActAsHostingGroup = ctx.authorizationService.hasAnyGroupAffiliation(
          ctx.principal.affiliations,
          hostingGroupSlugs
        )

        if (!canActAsHostingGroup) {
          throw new ForbiddenError(
            `User(ID=${ctx.principal.subject}) is not authorized to notify attendees of Event(ID=${event.id})`
          )
        }

        break
      }
    }
  }
}

const PaginatedNotificationsSchema = z.object({
  items: z.array(NotificationManagementSchema),
  nextCursor: NotificationManagementSchema.shape.id.optional(),
})

export type GetMyNotificationsInput = inferProcedureInput<typeof getMyNotificationsProcedure>
export type GetMyNotificationsOutput = inferProcedureOutput<typeof getMyNotificationsProcedure>
const getMyNotificationsProcedure = procedure
  .input(PaginateInputSchema)
  .output(
    z.object({
      items: z.array(UserNotificationSchema),
      nextCursor: UserNotificationSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const items = await ctx.notificationService.findManyForUser(ctx.handle, ctx.principal.subject, input)

    return {
      items,
      nextCursor: items.length === input.take ? items.at(-1)?.id : undefined,
    }
  })

export type GetMyUnreadCountInput = inferProcedureInput<typeof getMyUnreadCountProcedure>
export type GetMyUnreadCountOutput = inferProcedureOutput<typeof getMyUnreadCountProcedure>
const getMyUnreadCountProcedure = procedure
  .output(z.number().int().nonnegative())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return await ctx.notificationService.countUnreadForUser(ctx.handle, ctx.principal.subject)
  })

export type MarkAsReadInput = inferProcedureInput<typeof markAsReadProcedure>
export type MarkAsReadOutput = inferProcedureOutput<typeof markAsReadProcedure>
const markAsReadProcedure = procedure
  .input(
    z.object({
      notificationId: NotificationSchema.shape.id,
    })
  )
  .output(z.boolean())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    return await ctx.notificationService.markAsRead(ctx.handle, input.notificationId, ctx.principal.subject)
  })

export type MarkAllAsReadInput = inferProcedureInput<typeof markAllAsReadProcedure>
export type MarkAllAsReadOutput = inferProcedureOutput<typeof markAllAsReadProcedure>
const markAllAsReadProcedure = procedure
  .output(z.number().int().nonnegative())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ ctx }) => {
    return await ctx.notificationService.markAllAsRead(ctx.handle, ctx.principal.subject)
  })

export type OnNewNotificationInput = inferProcedureInput<typeof onNewNotificationProcedure>
export type OnNewNotificationOutput = inferProcedureOutput<typeof onNewNotificationProcedure>
const onNewNotificationProcedure = procedure.use(withAuthentication()).subscription(async function* ({ ctx, signal }) {
  yield* ctx.notificationService.subscribeToNewNotifications(ctx.principal.subject, signal)
})

export type FindNotificationInput = inferProcedureInput<typeof findNotificationProcedure>
export type FindNotificationOutput = inferProcedureOutput<typeof findNotificationProcedure>
const findNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .output(NotificationManagementSchema.nullable())
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return await ctx.notificationService.findById(ctx.handle, input)
  })

export type GetNotificationInput = inferProcedureInput<typeof getNotificationProcedure>
export type GetNotificationOutput = inferProcedureOutput<typeof getNotificationProcedure>
const getNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .output(NotificationManagementSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return await ctx.notificationService.getById(ctx.handle, input)
  })

export type FindNotificationsInput = inferProcedureInput<typeof findNotificationsProcedure>
export type FindNotificationsOutput = inferProcedureOutput<typeof findNotificationsProcedure>
const findNotificationsProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      filters: NotificationFilterQuerySchema.default({}),
    })
  )
  .output(PaginatedNotificationsSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filters, ...page } = input
    const items = await ctx.notificationService.findMany(ctx.handle, filters, page)

    return {
      items,
      nextCursor: items.length === page.take ? items.at(-1)?.id : undefined,
    }
  })

export type PreviewAudienceInput = inferProcedureInput<typeof previewAudienceProcedure>
export type PreviewAudienceOutput = inferProcedureOutput<typeof previewAudienceProcedure>
const previewAudienceProcedure = procedure
  .input(
    z.object({
      audience: NotificationAudienceSchema,
      type: NotificationTypeSchema,
    })
  )
  .output(NotificationAudiencePreviewSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await assertCanTargetAudience(ctx, input.audience)

    return await ctx.notificationService.previewAudience(ctx.handle, input.audience, input.type)
  })

export type CreateNotificationInput = inferProcedureInput<typeof createNotificationProcedure>
export type CreateNotificationOutput = inferProcedureOutput<typeof createNotificationProcedure>
const createNotificationProcedure = procedure
  .input(NotificationCreateSchema)
  .output(
    z.object({
      notification: NotificationManagementSchema,
      recipientCount: z.number().int().nonnegative(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    assertCanActAsGroup(ctx, input.actorGroupId)
    await assertCanTargetAudience(ctx, input.audience)

    const isImportantBroadcast = input.type === "BROADCAST_IMPORTANT"
    const isAdministrator = ctx.authorizationService.isAdministrator(ctx.principal.affiliations)

    if (isImportantBroadcast && !isAdministrator) {
      throw new ForbiddenError(`User(ID=${ctx.principal.subject}) is not authorized to send important notifications`)
    }

    return await ctx.notificationService.send(ctx.handle, {
      type: input.type,
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      link: input.link,
      audience: input.audience,
      actorGroupId: input.actorGroupId,
      createdById: ctx.principal.subject,
    })
  })

export type EditNotificationInput = inferProcedureInput<typeof editNotificationProcedure>
export type EditNotificationOutput = inferProcedureOutput<typeof editNotificationProcedure>
const editNotificationProcedure = procedure
  .input(
    z.object({
      id: NotificationSchema.shape.id,
      input: NotificationUpdateSchema.omit({
        lastUpdatedById: true,
      }),
    })
  )
  .output(NotificationManagementSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input.id)

    assertCanManageNotification(ctx, notification)

    return await ctx.notificationService.update(ctx.handle, input.id, {
      ...input.input,
      lastUpdatedById: ctx.principal.subject,
    })
  })

export type DeleteNotificationInput = inferProcedureInput<typeof deleteNotificationProcedure>
export type DeleteNotificationOutput = inferProcedureOutput<typeof deleteNotificationProcedure>
const deleteNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input)

    assertCanManageNotification(ctx, notification)

    await ctx.notificationService.delete(ctx.handle, input)
  })

export type FindRecipientsInput = inferProcedureInput<typeof findRecipientsProcedure>
export type FindRecipientsOutput = inferProcedureOutput<typeof findRecipientsProcedure>
const findRecipientsProcedure = procedure
  .input(BasePaginateInputSchema.extend({ notificationId: NotificationSchema.shape.id }))
  .output(
    z.object({
      items: z.array(NotificationRecipientListItemSchema),
      nextCursor: NotificationRecipientListItemSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { notificationId, ...page } = input
    const notification = await ctx.notificationService.getById(ctx.handle, notificationId)

    assertCanManageNotification(ctx, notification)

    const items = await ctx.notificationService.findRecipients(ctx.handle, notificationId, page)

    return {
      items,
      nextCursor: items.length === page.take ? items.at(-1)?.id : undefined,
    }
  })

export type GetRecipientStatsInput = inferProcedureInput<typeof getRecipientStatsProcedure>
export type GetRecipientStatsOutput = inferProcedureOutput<typeof getRecipientStatsProcedure>
const getRecipientStatsProcedure = procedure
  .input(NotificationSchema.shape.id)
  .output(NotificationRecipientStatsSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input)

    assertCanManageNotification(ctx, notification)

    return await ctx.notificationService.getRecipientStats(ctx.handle, input)
  })

export type AddRecipientsInput = inferProcedureInput<typeof addRecipientsProcedure>
export type AddRecipientsOutput = inferProcedureOutput<typeof addRecipientsProcedure>
const addRecipientsProcedure = procedure
  .input(
    z.object({
      notificationId: NotificationSchema.shape.id,
      audience: NotificationAudienceSchema,
    })
  )
  .output(
    z.object({
      addedCount: z.number().int().nonnegative(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input.notificationId)

    assertCanManageNotification(ctx, notification)
    await assertCanTargetAudience(ctx, input.audience)

    const addedCount = await ctx.notificationService.addRecipients(ctx.handle, input.notificationId, input.audience)

    return { addedCount }
  })

export type RemoveRecipientsInput = inferProcedureInput<typeof removeRecipientsProcedure>
export type RemoveRecipientsOutput = inferProcedureOutput<typeof removeRecipientsProcedure>
const removeRecipientsProcedure = procedure
  .input(
    z.object({
      notificationId: NotificationSchema.shape.id,
      userIds: z.array(z.string()).min(1),
    })
  )
  .output(
    z.object({
      removedCount: z.number().int().nonnegative(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input.notificationId)

    assertCanManageNotification(ctx, notification)

    const removedCount = await ctx.notificationService.removeRecipients(ctx.handle, input.notificationId, input.userIds)

    return { removedCount }
  })

export const notificationRouter = t.router({
  // User
  getMyNotifications: getMyNotificationsProcedure,
  getMyUnreadCount: getMyUnreadCountProcedure,
  markAsRead: markAsReadProcedure,
  markAllAsRead: markAllAsReadProcedure,
  onNewNotification: onNewNotificationProcedure,

  // Management
  find: findNotificationProcedure,
  get: getNotificationProcedure,
  findMany: findNotificationsProcedure,
  previewAudience: previewAudienceProcedure,
  create: createNotificationProcedure,
  edit: editNotificationProcedure,
  delete: deleteNotificationProcedure,
  findRecipients: findRecipientsProcedure,
  getRecipientStats: getRecipientStatsProcedure,
  addRecipients: addRecipientsProcedure,
  removeRecipients: removeRecipientsProcedure,
})
