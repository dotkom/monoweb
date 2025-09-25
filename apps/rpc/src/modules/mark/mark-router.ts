import { GroupSchema, MarkFilterQuerySchema, MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import z from "zod"
import { BasePaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"
import { personalMarkRouter } from "./personal-mark-router"

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
      ctx.executeAuditedTransaction(async (handle) => ctx.markService.createMark(handle, input.data, input.groupIds))
    ),
  edit: staffProcedure
    .input(
      z.object({
        changes: MarkWriteSchema.required({ id: true }),
        groupIds: GroupSchema.shape.slug.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) =>
        ctx.markService.updateMark(handle, input.changes.id, input.changes, input.groupIds)
      )
    ),
  get: procedure
    .input(MarkSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.markService.getMark(handle, input))),
  findMany: procedure
    .input(BasePaginateInputSchema.extend({ filter: MarkFilterQuerySchema.optional() }))
    .query(async ({ input, ctx }) => {
      const { filter, ...page } = input

      const marks = await ctx.executeTransaction(async (handle) =>
        ctx.markService.findMany(handle, { ...filter }, page)
      )

      return {
        items: marks,
        nextCursor: marks.at(-1)?.id,
      }
    }),
  delete: staffProcedure
    .input(MarkSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => ctx.markService.deleteMark(handle, input))
    ),
})
