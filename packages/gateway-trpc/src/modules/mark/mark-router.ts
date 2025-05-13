import { PaginateInputSchema } from "@dotkomonline/core"
import { MarkSchema, MarkWriteSchema, UserSchema } from "@dotkomonline/types"
import { t } from "../../trpc"
import { adminProcedure } from "../../trpc"
import { personalMarkRouter } from "./personal-mark-router"
import { z } from "zod"

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: adminProcedure.input(MarkWriteSchema).mutation(async ({ input, ctx }) => ctx.markService.createMark(input)),
  edit: adminProcedure
    .input(MarkWriteSchema.required({ id: true }))
    .mutation(async ({ input: changes, ctx }) => ctx.markService.updateMark(changes.id, changes)),
  all: adminProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => ctx.markService.getMarks(input)),
  get: adminProcedure.input(MarkSchema.shape.id).query(async ({ input, ctx }) => ctx.markService.getMark(input)),
  delete: adminProcedure
    .input(MarkSchema.shape.id)
    .mutation(async ({ input, ctx }) => ctx.markService.deleteMark(input)),
  getActiveMarksByUserId: adminProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) => ctx.markService.getActiveMarksByUserId(input.id)),
  getActiveMarkSumForUserId: adminProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) => ctx.markService.getActiveMarkSumForUserId(input.id)),
  getPostponementMinutesForUserId: adminProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) => ctx.markService.getPostponementMinutesForUserId(input.id)),
  getSuspensionEndTimeForUserId: adminProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) => ctx.markService.getSuspensionEndTimeForUserId(input.id)),
  isSuspended: adminProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) => ctx.markService.isSuspended(input.id)),
})
