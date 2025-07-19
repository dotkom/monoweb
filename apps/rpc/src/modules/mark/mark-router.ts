import { MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "../../query"
import { t } from "../../trpc"
import { procedure } from "../../trpc"
import { personalMarkRouter } from "./personal-mark-router"

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: procedure
    .input(MarkWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.markService.createMark(handle, input))
    ),
  edit: procedure
    .input(MarkWriteSchema.required({ id: true }))
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.markService.updateMark(handle, changes.id, changes))
    ),
  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.markService.getMarks(handle, input))),
  get: procedure
    .input(MarkSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.markService.getMark(handle, input))),
  delete: procedure
    .input(MarkSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.markService.deleteMark(handle, input))
    ),
})
