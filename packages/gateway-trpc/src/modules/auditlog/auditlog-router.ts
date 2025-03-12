import { AuditlogSchema, AuditlogWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { PaginateInputSchema } from "@dotkomonline/core"

export const auditlogRouter = t.router({
  create: t.procedure
    .input(AuditlogWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.AuditlogService.create(input)),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx }) => await ctx.AuditlogService.getAll()),
  get: t.procedure
    .input(AuditlogSchema.shape.id)
    .query(async ({ ctx }) => ctx.AuditlogService.getAll()),
})
