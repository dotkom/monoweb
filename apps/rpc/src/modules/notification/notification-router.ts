import { on } from "node:events"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import {
  NotificationDTOSchema,
  NotificationSchema,
  NotificationWriteSchema,
  UserNotificationDTOSchema,
  UserNotificationSchema,
} from "./notification-types"
import type { Notification } from "./notification-types"
import { isCommitteeMember } from "src/authorization"

export type GetNotificationInput = inferProcedureInput<typeof getNotificationProcedure>
export type GetNotificationOutput = inferProcedureOutput<typeof getNotificationProcedure>
const getNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .output(NotificationDTOSchema.nullable())
  .use(withDatabaseTransaction())
  .query(({ input, ctx }) => {
    return ctx.notificationService.findById(ctx.handle, input)
  })

export type CreateNotificationInput = inferProcedureInput<typeof createNotificationProcedure>
export type CreateNotificationOutput = inferProcedureOutput<typeof createNotificationProcedure>
const createNotificationProcedure = procedure
  .input(NotificationWriteSchema)
  .output(NotificationDTOSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(({ input, ctx }) => {
    return ctx.notificationService.create(
      ctx.handle,
      input.recipientIds,
      input.type,
      input.title,
      input.shortDescription ?? input.title,
      input.actorGroupId,
      input.payloadType,
      input.payload
    )
  })

export type EditNotificationInput = inferProcedureInput<typeof editNotificationProcedure>
export type EditNotificationOutput = inferProcedureOutput<typeof editNotificationProcedure>
const editNotificationProcedure = procedure
  .input(
    z.object({
      id: NotificationSchema.shape.id,
      input: NotificationWriteSchema.partial(),
    })
  )
  .output(NotificationDTOSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))

  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: changes, ctx }) => {
    return ctx.notificationService.update(ctx.handle, changes.id, changes.input)
  })

export type DeleteNotificationInput = inferProcedureInput<typeof deleteNotificationProcedure>
export type DeleteNotificationOutput = inferProcedureOutput<typeof deleteNotificationProcedure>
const deleteNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .output(z.boolean())
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))

  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.notificationService.delete(ctx.handle, input)
  })

export type GetMyNotificationsInput = inferProcedureInput<typeof getMyNotificationsProcedure>
export type GetMyNotificationsOutput = inferProcedureOutput<typeof getMyNotificationsProcedure>
const getMyNotificationsProcedure = procedure
  .input(BasePaginateInputSchema)
  .output(
    z.object({ items: z.array(UserNotificationDTOSchema), nextCursor: UserNotificationSchema.shape.id.optional() })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const notifications = await ctx.notificationService.findAllForUser(ctx.handle, ctx.principal.subject, input)
    return {
      items: notifications,
      nextCursor: notifications.length === input.take ? notifications.at(-1)?.id : undefined,
    }
  })

export type GetUnreadCountInput = inferProcedureInput<typeof getUnreadCountProcedure>
export type GetUnreadCountOutput = inferProcedureOutput<typeof getUnreadCountProcedure>
const getUnreadCountProcedure = procedure
  .output(z.number())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return ctx.notificationService.getUnreadCountForUser(ctx.handle, ctx.principal.subject)
  })

export type MarkAsReadInput = inferProcedureInput<typeof markAsReadProcedure>
export type MarkAsReadOutput = inferProcedureOutput<typeof markAsReadProcedure>
const markAsReadProcedure = procedure
  .input(z.object({ notificationId: NotificationSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    return ctx.notificationService.markAsRead(ctx.handle, input.notificationId, ctx.principal.subject)
  })

export type MarkAllAsReadInput = inferProcedureInput<typeof markAllAsReadProcedure>
export type MarkAllAsReadOutput = inferProcedureOutput<typeof markAllAsReadProcedure>
const markAllAsReadProcedure = procedure
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ ctx }) => {
    return ctx.notificationService.markAllAsRead(ctx.handle, ctx.principal.subject)
  })

export type FindNotificationsInput = inferProcedureInput<typeof findNotificationsProcedure>
export type FindNotificationsOutput = inferProcedureOutput<typeof findNotificationsProcedure>
const findNotificationsProcedure = procedure
  .input(PaginateInputSchema)
  .output(z.object({ items: z.array(NotificationDTOSchema), nextCursor: NotificationSchema.shape.id.optional() }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))

  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const items = await ctx.notificationService.findMany(ctx.handle, input)

    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

export type OnNewNotificationInput = inferProcedureInput<typeof onNewNotificationProcedure>
export type OnNewNotificationOutput = inferProcedureOutput<typeof onNewNotificationProcedure>
const onNewNotificationProcedure = procedure
  .use(withAuthentication())
  .subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(ctx.eventEmitter, "notification:new", { signal })) {
      const { userId, notification } = data as { userId: string; notification: Notification }
      if (userId !== ctx.principal.subject) {
        continue
      }
      yield notification
    }
  })

export const notificationRouter = t.router({
  get: getNotificationProcedure,
  create: createNotificationProcedure,
  edit: editNotificationProcedure,
  delete: deleteNotificationProcedure,
  getMyNotifications: getMyNotificationsProcedure,
  getUnreadCount: getUnreadCountProcedure,
  markAsRead: markAsReadProcedure,
  markAllAsRead: markAllAsReadProcedure,
  findMany: findNotificationsProcedure,
  onNewNotification: onNewNotificationProcedure,
})
