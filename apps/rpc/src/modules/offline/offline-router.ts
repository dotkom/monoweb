import { OfflineSchema, OfflineWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"

export const offlineRouter = t.router({
  create: staffProcedure
    .input(OfflineWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => ctx.offlineService.create(handle, input))
    ),
  edit: staffProcedure
    .input(
      z.object({
        id: OfflineSchema.shape.id,
        input: OfflineWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => ctx.offlineService.update(handle, changes.id, changes.input))
    ),
  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.offlineService.findMany(handle, input))
    ),
  find: procedure
    .input(OfflineSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.offlineService.findById(handle, input))
    ),
  get: procedure
    .input(OfflineSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.offlineService.getById(handle, input))
    ),
  createFileUpload: staffProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.offlineService.createFileUpload(handle, input.filename, input.contentType, ctx.principal.subject)
      })
    ),
})
