import { MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "../../query"
import { staffProcedure, t } from "../../trpc"
import { procedure } from "../../trpc"
import { personalMarkRouter } from "./personal-mark-router"

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: staffProcedure
    .input(MarkWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransactionWithAudit(async (handle) => ctx.markService.createMark(handle, input), ctx.principal.subject || null)
    ),
  edit: staffProcedure
    .input(MarkWriteSchema.required({ id: true }))
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeTransactionWithAudit(async (handle) => ctx.markService.updateMark(handle, changes.id, changes), ctx.principal.subject || null)
    ),
  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.markService.getMarks(handle, input))),
  get: procedure
    .input(MarkSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.markService.getMark(handle, input))),
  delete: staffProcedure
    .input(MarkSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransactionWithAudit(async (handle) => ctx.markService.deleteMark(handle, input), ctx.principal.subject || null)
    ),
})
