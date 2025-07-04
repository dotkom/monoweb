import { PaginateInputSchema } from "@dotkomonline/core"
import { OfflineSchema, OfflineWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, publicProcedure, t } from "../../trpc"

export const offlineRouter = t.router({
  create: adminProcedure.input(OfflineWriteSchema).mutation(async ({ input, ctx }) => ctx.offlineService.create(input)),
  edit: adminProcedure
    .input(
      z.object({
        id: OfflineSchema.shape.id,
        input: OfflineWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.offlineService.update(changes.id, changes.input)),
  all: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => ctx.offlineService.getAll(input)),
  get: publicProcedure.input(OfflineSchema.shape.id).query(async ({ input, ctx }) => ctx.offlineService.getById(input)),
  createPresignedPost: adminProcedure
    .input(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.offlineService.createPresignedPost(input.filename, input.mimeType)),
})
