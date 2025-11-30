import { AuditLogFilterQuerySchema, AuditLogSchema } from "@dotkomonline/types"
import z from "zod"
import { BasePaginateInputSchema, PaginateInputSchema } from "../../query"
import { staffProcedure, t } from "../../trpc"

export const auditLogRouter = t.router({
  findAuditLogs: staffProcedure
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
    .query(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation("dotkom", "hs")
      const items = await ctx.executeTransaction(async (handle) =>
        ctx.auditLogService.findMany(handle, { ...input?.filter }, input)
      )
      return {
        items,
        nextCursor: items.at(-1)?.id || null,
      }
    }),

  all: staffProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation("dotkom", "hs")
    return ctx.executeTransaction(async (handle) => ctx.auditLogService.findMany(handle, {}, input))
  }),

  findById: staffProcedure.input(AuditLogSchema.shape.id).query(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation("dotkom", "hs")
    return ctx.executeTransaction(async (handle) => ctx.auditLogService.findById(handle, input))
  }),

  getById: staffProcedure.input(AuditLogSchema.shape.id).query(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation("dotkom", "hs")
    return ctx.executeTransaction(async (handle) => ctx.auditLogService.getById(handle, input))
  }),

  getByUserId: staffProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation("dotkom", "hs")
    return ctx.executeTransaction(async (handle) =>
      ctx.auditLogService.findManyByUserId(handle, ctx.principal.subject, input)
    )
  }),
})
