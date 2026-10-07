import { BasePaginateInputSchema, PaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { isAdministrator } from "../../authorization"
import { withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { AuditActivitySchema, AuditLogFilterQuerySchema, AuditLogSchema } from "./audit-log"

export type FindAuditLogsInput = inferProcedureInput<typeof findAuditLogsProcedure>
export type FindAuditLogsOutput = inferProcedureOutput<typeof findAuditLogsProcedure>
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
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const items = await ctx.auditLogService.findMany(ctx.handle, { ...input?.filter }, input)
    return {
      items,
      nextCursor: items.at(-1)?.id || null,
    }
  })

export type AllAuditLogsInput = inferProcedureInput<typeof allAuditLogsProcedure>
export type AllAuditLogsOutput = inferProcedureOutput<typeof allAuditLogsProcedure>
const allAuditLogsProcedure = procedure
  .input(PaginateInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.findMany(ctx.handle, {}, input)
  })

export type GetAuditLogByIdInput = inferProcedureInput<typeof getAuditLogByIdProcedure>
export type GetAuditLogByIdOutput = inferProcedureOutput<typeof getAuditLogByIdProcedure>
const getAuditLogByIdProcedure = procedure
  .input(AuditLogSchema.shape.id)
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.getById(ctx.handle, input)
  })

export type GetAuditLogsByUserIdInput = inferProcedureInput<typeof getAuditLogsByUserIdProcedure>
export type GetAuditLogsByUserIdOutput = inferProcedureOutput<typeof getAuditLogsByUserIdProcedure>
const getAuditLogsByUserIdProcedure = procedure
  .input(PaginateInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.findManyByUserId(ctx.handle, ctx.principal.subject, input)
  })

export type FindAuditActivitiesInput = inferProcedureInput<typeof findAuditActivitiesProcedure>
export type FindAuditActivitiesOutput = inferProcedureOutput<typeof findAuditActivitiesProcedure>
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
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const auditActivities = await ctx.auditLogService.findManyAuditActivities(
      ctx.handle,
      { ...input?.filter },
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
