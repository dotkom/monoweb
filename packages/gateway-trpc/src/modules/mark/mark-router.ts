import { MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "@dotkomonline/core"
import { personalMarkRouter } from "./personal-mark-router"
import { protectedProcedure } from "./../../trpc"
import { t } from "../../trpc"

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: protectedProcedure
    .input(MarkWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.markService.createMark(input)),
  edit: protectedProcedure
    .input(MarkWriteSchema.required({ id: true }))
    .mutation(async ({ input: changes, ctx }) => ctx.markService.updateMark(changes.id, changes)),
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.markService.getMarks(input.take, input.cursor)),
  get: protectedProcedure.input(MarkSchema.shape.id).query(async ({ input, ctx }) => ctx.markService.getMark(input)),
  delete: protectedProcedure
    .input(MarkSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.markService.deleteMark(input)),
})
