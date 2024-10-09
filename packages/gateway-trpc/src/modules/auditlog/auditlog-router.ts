import { PaginateInputSchema } from "@dotkomonline/core"
import { AuditlogSchema, AuditlogWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, t } from "../../trpc"

export const auditlogRouter = t.router({
  create: protectedProcedure
    .input(AuditlogWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.auditlogService.createAuditlog(input)),
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.auditlogService.getAuditlogs(input)),
  allIds: t.procedure.query(async ({ ctx }) => ctx.auditlogService.getAllAuditlogIds()),
  get: protectedProcedure
    .input(AuditlogSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.auditlogService.getAuditlog(input)),
})
