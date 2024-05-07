import { PaginateInputSchema } from "@dotkomonline/core"
import { OfflineSchemaWithoutAssets, OfflineWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const offlineRouter = t.router({
  create: t.procedure.input(OfflineWriteSchema).mutation(async ({ input, ctx }) => ctx.offlineService.create(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: OfflineSchemaWithoutAssets.shape.id,
        input: OfflineWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.offlineService.update(changes.id, changes.input)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.offlineService.getAll(input.take, input.cursor)),
  get: t.procedure
    .input(OfflineSchemaWithoutAssets.shape.id)
    .query(async ({ input, ctx }) => ctx.offlineService.get(input)),
  createPresignedPost: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.offlineService.createPresignedPost(input.filename, input.mimeType)),
})
