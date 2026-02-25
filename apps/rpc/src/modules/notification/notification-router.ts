import { NotificationSchema, NotificationWriteSchema, UserNotificationSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"

export type GetNotificationInput = inferProcedureInput<typeof getNotificationProcedure>
export type GetNotificationOutput = inferProcedureOutput<typeof getNotificationProcedure>
const getNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.notificationService.findById(ctx.handle, input)
  })

export type CreateNotificationInput = inferProcedureInput<typeof createNotificationProcedure>
export type CreateNotificationOutput = inferProcedureOutput<typeof createNotificationProcedure>
const createNotificationProcedure = procedure
  .input(NotificationWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.notificationService.create(ctx.handle, input)
  })

export type EditNotificationInput = inferProcedureInput<typeof editNotificationProcedure>
export type EditNotificationOutput = inferProcedureOutput<typeof editNotificationProcedure>
const editNotificationProcedure = procedure
  .input(z.object({
    id: NotificationSchema.shape.id,
    input: NotificationWriteSchema.partial(),
  }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: changes, ctx }) => {
    return ctx.notificationService.update(ctx.handle, changes.id, changes.input)
  })

export type DeleteNotificationInput = inferProcedureInput<typeof deleteNotificationProcedure>
export type DeleteNotificationOutput = inferProcedureOutput<typeof deleteNotificationProcedure>
const deleteNotificationProcedure = procedure
  .input(NotificationSchema.shape.id)
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.notificationService.delete(ctx.handle, input)
  })

export type GetMyNotificationsInput = inferProcedureInput<typeof getMyNotificationsProcedure>
export type GetMyNotificationsOutput = inferProcedureOutput<typeof getMyNotificationsProcedure>
const getMyNotificationsProcedure = procedure
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return ctx.notificationService.findAllForUser(ctx.handle, ctx.principal.subject)
  })

export type GetUnreadCountInput = inferProcedureInput<typeof getUnreadCountProcedure>
export type GetUnreadCountOutput = inferProcedureOutput<typeof getUnreadCountProcedure>
const getUnreadCountProcedure = procedure
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

export const notificationRouter = t.router({
  get: getNotificationProcedure,
  create: createNotificationProcedure,
  edit: editNotificationProcedure,
  delete: deleteNotificationProcedure,
  getMyNotifications: getMyNotificationsProcedure,
  getUnreadCount: getUnreadCountProcedure,
  markAsRead: markAsReadProcedure,
  markAllAsRead: markAllAsReadProcedure,
})