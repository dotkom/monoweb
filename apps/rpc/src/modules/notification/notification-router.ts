import type { DBHandle } from "@dotkomonline/db"
import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withDatabaseTransaction } from "../../middlewares"
import { canManageArticles } from "../../permissions/article-permissions"
import { canManageJobListings } from "../../permissions/job-listing-permissions"
import { canManageOfflines } from "../../permissions/offline-permissions"
import {
  canCreateNotification,
  canListNotifications,
  canManageNotification,
  canTargetAllUsers,
  canTargetEventAttendees,
  canTargetGroupMembers,
  canTargetSpecificUsers,
} from "../../permissions/notification-permissions"
import { type TRPCContext, procedure, procedureTraceErrorsOnly, t } from "../../trpc"
import {
  NotificationCreateSchema,
  NotificationFilterQuerySchema,
  NotificationManagementSchema,
  type NotificationSource,
  NotificationRecipientFilterQuerySchema,
  NotificationRecipientListItemSchema,
  type NotificationRecipientSelection,
  NotificationRecipientSelectionPreviewSchema,
  NotificationRecipientSelectionSchema,
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

async function authorizeNotificationSource(context: AuthenticatedContext, source: NotificationSource): Promise<void> {
  switch (source.type) {
    case "GLOBAL": {
      return
    }

    case "EVENT": {
      const event = await context.eventService.getEventById(context.handle, source.eventId)

      await context.addAuthorizationGuard(
        permitIf((principal) => canTargetEventAttendees(principal, event.hostingGroups)),
        source
      )

      return
    }

    case "GROUP": {
      const group = await context.groupService.getBySlug(context.handle, source.groupSlug)

      await context.addAuthorizationGuard(
        permitIf((principal) => canTargetGroupMembers(principal, group)),
        source
      )

      return
    }

    case "ARTICLE": {
      await context.addAuthorizationGuard(
        permitIf((principal) => canManageArticles(principal)),
        source
      )

      return
    }

    case "USER": {
      await context.addAuthorizationGuard(
        permitIf((principal) => canTargetSpecificUsers(principal)),
        source
      )

      return
    }

    case "OFFLINE": {
      await context.addAuthorizationGuard(
        permitIf((principal) => canManageOfflines(principal)),
        source
      )

      return
    }

    case "JOB_LISTING": {
      await context.addAuthorizationGuard(
        permitIf((principal) => canManageJobListings(principal)),
        source
      )

      return
    }
  }
}

/**
 * Checks each recipient selection rule against the caller:
 * - `ALL_USERS` is administrator-only.
 * - `GROUP_MEMBERS` requires affiliation with that group.
 * - `EVENT_ATTENDEES` requires affiliation with one of the event's hosting groups.
 * - `USERS` is administrator-only.
 *
 * NOTE: This method expects a prior committee member check for preview, or create authorization for send.
 */
async function authorizeRecipientSelection(
  ctx: AuthenticatedContext,
  recipientSelection: NotificationRecipientSelection
): Promise<void> {
  for (const rule of recipientSelection.rules) {
    switch (rule.type) {
      case "ALL_USERS": {
        await ctx.addAuthorizationGuard(
          permitIf((principal) => canTargetAllUsers(principal)),
          rule
        )

        break
      }

      case "USERS": {
        await ctx.addAuthorizationGuard(
          permitIf((principal) => canTargetSpecificUsers(principal)),
          rule
        )

        break
      }

      case "GROUP_MEMBERS": {
        const group = await ctx.groupService.getBySlug(ctx.handle, rule.groupSlug)

        await ctx.addAuthorizationGuard(
          permitIf((principal) => canTargetGroupMembers(principal, group)),
          rule
        )

        break
      }

      case "EVENT_ATTENDEES": {
        const event = await ctx.eventService.getByAttendanceId(ctx.handle, rule.attendanceId)

        await ctx.addAuthorizationGuard(
          permitIf((principal) => canTargetEventAttendees(principal, event.hostingGroups)),
          rule
        )

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
const getMyNotificationsProcedure = procedureTraceErrorsOnly
  .input(PaginateInputSchema)
  .output(
    z.object({
      items: z.array(UserNotificationSchema),
      nextCursor: UserNotificationSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    const items = await ctx.notificationService.findManyForUser(ctx.prisma, ctx.principal.subject, input)

    return {
      items,
      nextCursor: items.length === input.take ? items.at(-1)?.id : undefined,
    }
  })

export type GetMyUnreadCountInput = inferProcedureInput<typeof getMyUnreadCountProcedure>
export type GetMyUnreadCountOutput = inferProcedureOutput<typeof getMyUnreadCountProcedure>
const getMyUnreadCountProcedure = procedureTraceErrorsOnly
  .output(z.number().int().nonnegative())
  .use(withAuthentication())
  .query(async ({ ctx }) => {
    return await ctx.notificationService.countUnreadForUser(ctx.prisma, ctx.principal.subject)
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
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(
      permitIf((principal) => canListNotifications(principal)),
      input
    )

    return await ctx.notificationService.findById(ctx.handle, input)
  })

export type GetNotificationInput = inferProcedureInput<typeof getNotificationProcedure>
export type GetNotificationOutput = inferProcedureOutput<typeof getNotificationProcedure>
const getNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .output(NotificationManagementSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(
      permitIf((principal) => canListNotifications(principal)),
      input
    )

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
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(
      permitIf((principal) => canListNotifications(principal)),
      input
    )

    const { filters, ...page } = input
    const items = await ctx.notificationService.findMany(ctx.handle, filters, page)

    return {
      items,
      nextCursor: items.length === page.take ? items.at(-1)?.id : undefined,
    }
  })

export type PreviewRecipientSelectionInput = inferProcedureInput<typeof previewRecipientSelectionProcedure>
export type PreviewRecipientSelectionOutput = inferProcedureOutput<typeof previewRecipientSelectionProcedure>
const previewRecipientSelectionProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      recipientSelection: NotificationRecipientSelectionSchema,
      type: NotificationTypeSchema,
      search: z.string().optional(),
      notificationId: NotificationSchema.shape.id.optional(),
      hideExistingRecipients: z.boolean().optional(),
    })
  )
  .output(NotificationRecipientSelectionPreviewSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(
      permitIf((principal) => canListNotifications(principal)),
      input
    )
    await authorizeRecipientSelection(ctx, input.recipientSelection)

    const { recipientSelection, type, search, notificationId, hideExistingRecipients, ...page } = input

    if (notificationId !== undefined) {
      const notification = await ctx.notificationService.getById(ctx.handle, notificationId)
      await ctx.addAuthorizationGuard(
        permitIf((principal) => canManageNotification(principal, notification.actorGroup)),
        input
      )
    }

    return await ctx.notificationService.previewRecipientSelection(ctx.handle, recipientSelection, type, page, search, {
      notificationId,
      hideExistingRecipients,
    })
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const actorGroup = await ctx.groupService.getBySlug(ctx.handle, input.actorGroupId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canCreateNotification(principal, actorGroup, input.type)),
      input
    )
    await authorizeRecipientSelection(ctx, input.recipientSelection)

    await authorizeNotificationSource(ctx, input.source)

    const sentNotification = await ctx.notificationService.send(ctx.handle, {
      type: input.type,
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      source: input.source,
      link: input.link,
      recipientSelection: input.recipientSelection,
      actorGroupId: input.actorGroupId,
      createdById: ctx.principal.subject,
    })

    ctx.setAuditTransactionName(
      `Send Notification(ID=${sentNotification.notification.id},Title=${sentNotification.notification.title}) to ${sentNotification.recipientCount} ${sentNotification.recipientCount === 1 ? "recipient" : "recipients"}`
    )

    return sentNotification
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input.id)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageNotification(principal, notification.actorGroup)),
      input
    )

    const updatedNotification = await ctx.notificationService.update(ctx.handle, input.id, {
      ...input.input,
      lastUpdatedById: ctx.principal.subject,
    })

    ctx.setAuditTransactionName(`Update Notification(ID=${updatedNotification.id},Title=${updatedNotification.title})`)

    return updatedNotification
  })

export type DeleteNotificationInput = inferProcedureInput<typeof deleteNotificationProcedure>
export type DeleteNotificationOutput = inferProcedureOutput<typeof deleteNotificationProcedure>
const deleteNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageNotification(principal, notification.actorGroup)),
      input
    )

    await ctx.notificationService.delete(ctx.handle, input)

    ctx.setAuditTransactionName(`Delete Notification(ID=${notification.id},Title=${notification.title})`)

    return true
  })

export type FindRecipientsInput = inferProcedureInput<typeof findRecipientsProcedure>
export type FindRecipientsOutput = inferProcedureOutput<typeof findRecipientsProcedure>
const findRecipientsProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      notificationId: NotificationSchema.shape.id,
      filters: NotificationRecipientFilterQuerySchema.default({}),
    })
  )
  .output(
    z.object({
      items: z.array(NotificationRecipientListItemSchema),
      nextCursor: NotificationRecipientListItemSchema.shape.id.optional(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { notificationId, filters, ...page } = input
    const notification = await ctx.notificationService.getById(ctx.handle, notificationId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageNotification(principal, notification.actorGroup)),
      input
    )

    const items = await ctx.notificationService.findRecipients(ctx.handle, notificationId, filters, page)

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
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageNotification(principal, notification.actorGroup)),
      input
    )

    return await ctx.notificationService.getRecipientStats(ctx.handle, input)
  })

export type AddRecipientsInput = inferProcedureInput<typeof addRecipientsProcedure>
export type AddRecipientsOutput = inferProcedureOutput<typeof addRecipientsProcedure>
const addRecipientsProcedure = procedure
  .input(
    z.object({
      notificationId: NotificationSchema.shape.id,
      recipientSelection: NotificationRecipientSelectionSchema,
    })
  )
  .output(
    z.object({
      addedCount: z.number().int().nonnegative(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input.notificationId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageNotification(principal, notification.actorGroup)),
      input
    )
    await authorizeRecipientSelection(ctx, input.recipientSelection)

    const addedCount = await ctx.notificationService.addRecipients(
      ctx.handle,
      input.notificationId,
      input.recipientSelection
    )

    ctx.setAuditTransactionName(
      `Add ${addedCount} ${addedCount === 1 ? "recipient" : "recipients"} to Notification(ID=${input.notificationId},Title=${notification.title})`
    )

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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const notification = await ctx.notificationService.getById(ctx.handle, input.notificationId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageNotification(principal, notification.actorGroup)),
      input
    )

    const removedCount = await ctx.notificationService.removeRecipients(ctx.handle, input.notificationId, input.userIds)

    ctx.setAuditTransactionName(
      `Remove ${removedCount} ${removedCount === 1 ? "recipient" : "recipients"} from Notification(ID=${input.notificationId},Title=${notification.title})`
    )

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
  previewRecipientSelection: previewRecipientSelectionProcedure,
  create: createNotificationProcedure,
  edit: editNotificationProcedure,
  delete: deleteNotificationProcedure,
  findRecipients: findRecipientsProcedure,
  getRecipientStats: getRecipientStatsProcedure,
  addRecipients: addRecipientsProcedure,
  removeRecipients: removeRecipientsProcedure,
})
