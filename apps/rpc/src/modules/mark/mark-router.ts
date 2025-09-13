import { GroupSchema, MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import z from "zod"
import { PaginateInputSchema } from "../../query.ts"
import { procedure, staffProcedure, t } from "../../trpc.ts"
import { personalMarkRouter } from "./personal-mark-router.ts"

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: staffProcedure
    .input(
      z.object({
        data: MarkWriteSchema,
        groupIds: GroupSchema.shape.slug.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.markService.createMark(handle, input.data, input.groupIds))
    ),
  edit: staffProcedure
    .input(
      z.object({
        changes: MarkWriteSchema.required({ id: true }),
        groupIds: GroupSchema.shape.slug.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.markService.updateMark(handle, input.changes.id, input.changes, input.groupIds)
      )
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
      ctx.executeTransaction(async (handle) => ctx.markService.deleteMark(handle, input))
    ),
})
