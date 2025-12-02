import { AuditLogFilterQuerySchema, AuditLogSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { isAdministrator } from "../../authorization"
import { withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"

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

export const auditLogRouter = t.router({
  findAuditLogs: findAuditLogsProcedure,
  all: allAuditLogsProcedure,
  getById: getAuditLogByIdProcedure,
  getByUserId: getAuditLogsByUserIdProcedure,
})
