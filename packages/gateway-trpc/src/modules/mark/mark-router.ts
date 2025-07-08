import { PaginateInputSchema } from "@dotkomonline/core"
import { MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import { t } from "../../trpc"
import { adminProcedure } from "../../trpc"
import { personalMarkRouter } from "./personal-mark-router"

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: adminProcedure
    .input(MarkWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.markService.createMark(handle, input))
    ),
  edit: adminProcedure
    .input(MarkWriteSchema.required({ id: true }))
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.markService.updateMark(handle, changes.id, changes))
    ),
  all: adminProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.markService.getMarks(handle, input))),
  get: adminProcedure
    .input(MarkSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.markService.getMark(handle, input))),
  delete: adminProcedure
    .input(MarkSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.markService.deleteMark(handle, input))
    ),
})
