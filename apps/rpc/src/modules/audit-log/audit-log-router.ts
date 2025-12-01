import { AuditLogFilterQuerySchema, AuditLogSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { isAdministrator } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { staffProcedure, t } from "../../trpc"

export type FindAuditLogsInput = inferProcedureInput<typeof findAuditLogsProcedure>
export type FindAuditLogsOutput = inferProcedureOutput<typeof findAuditLogsProcedure>
const findAuditLogsProcedure = staffProcedure
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
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    const items = await ctx.auditLogService.findMany(ctx.handle, { ...input?.filter }, input)
    return {
      items,
      nextCursor: items.at(-1)?.id || null,
    }
  })

export type AllAuditLogsInput = inferProcedureInput<typeof allAuditLogsProcedure>
export type AllAuditLogsOutput = inferProcedureOutput<typeof allAuditLogsProcedure>
const allAuditLogsProcedure = staffProcedure
  .input(PaginateInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.findMany(ctx.handle, {}, input)
  })

export type GetAuditLogByIdInput = inferProcedureInput<typeof getAuditLogByIdProcedure>
export type GetAuditLogByIdOutput = inferProcedureOutput<typeof getAuditLogByIdProcedure>
const getAuditLogByIdProcedure = staffProcedure
  .input(AuditLogSchema.shape.id)
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.getById(ctx.handle, input)
  })

export type GetAuditLogsByUserIdInput = inferProcedureInput<typeof getAuditLogsByUserIdProcedure>
export type GetAuditLogsByUserIdOutput = inferProcedureOutput<typeof getAuditLogsByUserIdProcedure>
const getAuditLogsByUserIdProcedure = staffProcedure
  .input(PaginateInputSchema)
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    return ctx.auditLogService.findManyByUserId(ctx.handle, ctx.principal.subject, input)
  })

export const auditLogRouter = t.router({
  findAuditLogs: findAuditLogsProcedure,
  all: allAuditLogsProcedure,
  getById: getAuditLogByIdProcedure,
  getByUserId: getAuditLogsByUserIdProcedure,
})
