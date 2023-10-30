import { PaginateInputSchema } from "@dotkomonline/core"
import { OfflineSchema, OfflineWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const offlineRouter = t.router({
  create: t.procedure.input(OfflineWriteSchema).mutation(({ input, ctx }) => {
    return ctx.offlineService.create(input)
  }),
  edit: protectedProcedure
    .input(
      z.object({
        id: OfflineSchema.shape.id,
        input: OfflineWriteSchema,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.offlineService.update(changes.id, changes.input)
    }),
  all: t.procedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.offlineService.getAll(input.take, input.cursor)
  }),
  get: t.procedure.input(OfflineSchema.shape.id).query(({ input, ctx }) => {
    return ctx.offlineService.get(input)
  }),
})
