import { MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "@dotkomonline/core"
import { personalMarkRouter } from "./personal-mark-router"
import { protectedProcedure } from "./../../trpc"
import { t } from "../../trpc"

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: protectedProcedure.input(MarkWriteSchema).mutation(({ input, ctx }) => {
    return ctx.markService.createMark(input)
  }),
  edit: protectedProcedure.input(MarkWriteSchema.required({ id: true })).mutation(({ input: changes, ctx }) => {
    return ctx.markService.updateMark(changes.id, changes)
  }),
  all: protectedProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.markService.getMarks(input.take, input.cursor)
  }),
  get: protectedProcedure.input(MarkSchema.shape.id).query(({ input, ctx }) => {
    return ctx.markService.getMark(input)
  }),
  delete: protectedProcedure.input(MarkSchema.shape.id).mutation(({ input, ctx }) => {
    return ctx.markService.deleteMark(input)
  }),
})
