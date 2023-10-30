import { MarkSchema, MarkWriteSchema, PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "@dotkomonline/core"
import { protectedProcedure } from "./../../trpc"
import { t } from "../../trpc"
import { z } from "zod"

export const markRouter = t.router({
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
  getByUser: protectedProcedure
    .input(z.object({ id: UserSchema.shape.id, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.markService.getPersonalMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
    }),
  getByMark: protectedProcedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.markService.getPersonalMarksByMarkId(input.id)
    }),
  addToUser: protectedProcedure.input(PersonalMarkSchema).mutation(({ input, ctx }) => {
    return ctx.markService.addPersonalMarkToUserId(input.userId, input.markId)
  }),
  countUsersWithMark: protectedProcedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId }))
    .query(({ input, ctx }) => {
      return ctx.markService.countUsersByMarkId(input.id)
    }),
  removeFromUser: protectedProcedure.input(PersonalMarkSchema).mutation(({ input, ctx }) => {
    return ctx.markService.removePersonalMarkFromUserId(input.userId, input.markId)
  }),
  getExpiryDateForUser: protectedProcedure.input(UserSchema.shape.id).query(({ input, ctx }) => {
    return ctx.markService.getExpiryDateForUserId(input)
  }),
})
