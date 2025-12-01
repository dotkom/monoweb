import { OfflineSchema, OfflineWriteSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { PaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"

export type CreateOfflineInput = inferProcedureInput<typeof createOfflineProcedure>
export type CreateOfflineOutput = inferProcedureOutput<typeof createOfflineProcedure>
const createOfflineProcedure = staffProcedure
  .input(OfflineWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.offlineService.create(ctx.handle, input)
  })

export type EditOfflineInput = inferProcedureInput<typeof editOfflineProcedure>
export type EditOfflineOutput = inferProcedureOutput<typeof editOfflineProcedure>
const editOfflineProcedure = staffProcedure
  .input(
    z.object({
      id: OfflineSchema.shape.id,
      input: OfflineWriteSchema.partial(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: changes, ctx }) => {
    return ctx.offlineService.update(ctx.handle, changes.id, changes.input)
  })

export type AllOfflineInput = inferProcedureInput<typeof allOfflineProcedure>
export type AllOfflineOutput = inferProcedureOutput<typeof allOfflineProcedure>
const allOfflineProcedure = procedure
  .input(PaginateInputSchema)
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    return ctx.offlineService.findMany(ctx.handle, input)
  })

export type FindOfflineInput = inferProcedureInput<typeof findOfflineProcedure>
export type FindOfflineOutput = inferProcedureOutput<typeof findOfflineProcedure>
const findOfflineProcedure = procedure
  .input(OfflineSchema.shape.id)
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    return ctx.offlineService.findById(ctx.handle, input)
  })

export type GetOfflineInput = inferProcedureInput<typeof getOfflineProcedure>
export type GetOfflineOutput = inferProcedureOutput<typeof getOfflineProcedure>
const getOfflineProcedure = procedure
  .input(OfflineSchema.shape.id)
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    return ctx.offlineService.getById(ctx.handle, input)
  })

export type CreateOfflineFileUploadInput = inferProcedureInput<typeof createOfflineFileUploadProcedure>
export type CreateOfflineFileUploadOutput = inferProcedureOutput<typeof createOfflineFileUploadProcedure>
const createOfflineFileUploadProcedure = staffProcedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.offlineService.createFileUpload(ctx.handle, input.filename, input.contentType, ctx.principal.subject)
  })

export const offlineRouter = t.router({
  create: createOfflineProcedure,
  edit: editOfflineProcedure,
  all: allOfflineProcedure,
  find: findOfflineProcedure,
  get: getOfflineProcedure,
  createFileUpload: createOfflineFileUploadProcedure,
})
