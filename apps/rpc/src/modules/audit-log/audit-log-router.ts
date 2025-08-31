import { PaginateInputSchema } from "../../query"
import { staffProcedure, t } from "../../trpc"
import { AuditLogSchema } from "@dotkomonline/types";

export const auditLogRouter = t.router({
  all: staffProcedure.input(PaginateInputSchema).query(async ({ ctx, input }) => {
    ctx.authorize.requireAffiliation("dotkom")
    return ctx.executeTransaction(async (handle) => ctx.auditLogService.getAuditLogs(handle, input))
  }
  ),
  getById: staffProcedure.input(AuditLogSchema.shape.id)
    .query(async ({ input, ctx }) =>
    {
      ctx.authorize.requireAffiliation("dotkom","hs")
      return ctx.executeTransaction(async (handle) => ctx.auditLogService.getAuditLogById(handle, input))
    }
    )
    ,
  getByUserId: staffProcedure.input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
    {
      ctx.authorize.requireAffiliation("dotkom","hs")
      return ctx.executeTransaction(async (handle) => ctx.auditLogService.getAuditLogsByUserId(handle, ctx.principal.subject, input))
    }
    ),
});