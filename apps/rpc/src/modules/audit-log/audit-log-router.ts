import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import z from "zod"
import { permitIf } from "../../authorization"
import { withAuthentication, withAuthorization } from "../../middlewares"
import { canAccessAuditLog } from "../../permissions/audit-log-permissions"
import { procedure, t } from "../../trpc"
import { AuditActivitySchema, AuditLogFilterQuerySchema, AuditLogSchema } from "./audit-log"

const findAuditLogsProcedure = procedure
  .input(
    BasePaginateInputSchema.extend({
      filter: AuditLogFilterQuerySchema,
    })
  )
  .output(
    z.object({
      items: z.array(AuditLogSchema),
      nextCursor: AuditLogSchema.shape.id.nullable(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canAccessAuditLog(principal))))
  .query(async ({ input, ctx }) => {
    const items = await ctx.auditLogService.findMany(ctx.prisma, input.filter, input)

    return {
      items,
      nextCursor: items.at(-1)?.id || null,
    }
  })

const allAuditLogsProcedure = procedure
  .input(PaginateInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canAccessAuditLog(principal))))
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.findMany(ctx.prisma, {}, input)
  })

const getAuditLogByIdProcedure = procedure
  .input(AuditLogSchema.shape.id)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canAccessAuditLog(principal))))
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.getById(ctx.prisma, input)
  })

const getAuditLogsByUserIdProcedure = procedure
  .input(PaginateInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canAccessAuditLog(principal))))
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.findManyByUserId(ctx.prisma, ctx.principal.subject, input)
  })

const findAuditActivitiesProcedure = procedure
  .input(
    z.object({
      filter: AuditLogFilterQuerySchema,
      cursor: z.int().min(0).default(0),
      limit: z.int().min(1).max(100).default(20),
    })
  )
  .output(
    z.object({
      items: z.array(AuditActivitySchema),
      nextCursor: z.int().optional(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canAccessAuditLog(principal))))
  .query(async ({ input, ctx }) => {
    const auditActivities = await ctx.auditLogService.findManyAuditActivities(
      ctx.prisma,
      input.filter,
      input.cursor,
      input.limit
    )

    const nextCursor = auditActivities.length === input.limit ? input.cursor + input.limit : undefined

    return {
      items: auditActivities,
      nextCursor,
    }
  })

export const auditLogRouter = t.router({
  findAuditLogs: findAuditLogsProcedure,
  findAuditActivities: findAuditActivitiesProcedure,
  all: allAuditLogsProcedure,
  getById: getAuditLogByIdProcedure,
  getByUserId: getAuditLogsByUserIdProcedure,
})
