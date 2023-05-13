import { MarkWriteSchema } from "@dotkomonline/types"
import { protectedProcedure } from "./../../trpc"
import { t } from "../../trpc"
import { PaginateInputSchema } from "../../utils/db-utils"
import { z } from "zod"
import { personalMarkRouter } from "./personal-mark-router"

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
  allForUser: protectedProcedure
    .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.personalMarkService.getMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
    }),
  get: protectedProcedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.markService.getMark(input)
  }),
  delete: protectedProcedure.input(z.string().uuid()).mutation(({ input, ctx }) => {
    return ctx.markService.deleteMark(input)
  }),
})
