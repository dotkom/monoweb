import { GroupRoleTypeEnum } from "../group/group"
import { OfflineSchema, OfflineWriteSchema } from "./offline"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { hasGroupRole, isAdministrator, isCommitteeMember, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { PaginateInputSchema } from "@dotkomonline/utils"
import { procedure, t } from "../../trpc"
import { CommitteeGroupSlug } from "../authorization-service"

export type CreateOfflineInput = inferProcedureInput<typeof createOfflineProcedure>
export type CreateOfflineOutput = inferProcedureOutput<typeof createOfflineProcedure>
const createOfflineProcedure = procedure
  .input(OfflineWriteSchema)
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        hasGroupRole(CommitteeGroupSlug.REDAKSJONEN, GroupRoleTypeEnum.LEADER),
        hasGroupRole(CommitteeGroupSlug.REDAKSJONEN, GroupRoleTypeEnum.DEPUTY_LEADER)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdOffline = await ctx.offlineService.create(ctx.handle, input)

    ctx.setAuditTransactionName(`Create Offline(ID=${createdOffline.id},Title=${createdOffline.title})`)

    return createdOffline
  })

export type EditOfflineInput = inferProcedureInput<typeof editOfflineProcedure>
export type EditOfflineOutput = inferProcedureOutput<typeof editOfflineProcedure>
const editOfflineProcedure = procedure
  .input(
    z.object({
      id: OfflineSchema.shape.id,
      input: OfflineWriteSchema.partial(),
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        hasGroupRole(CommitteeGroupSlug.REDAKSJONEN, GroupRoleTypeEnum.LEADER),
        hasGroupRole(CommitteeGroupSlug.REDAKSJONEN, GroupRoleTypeEnum.DEPUTY_LEADER)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input: changes, ctx }) => {
    const updatedOffline = await ctx.offlineService.update(ctx.handle, changes.id, changes.input)

    ctx.setAuditTransactionName(`Update Offline(ID=${updatedOffline.id},Title=${updatedOffline.title})`)

    return updatedOffline
  })

export type AllOfflineInput = inferProcedureInput<typeof allOfflineProcedure>
export type AllOfflineOutput = inferProcedureOutput<typeof allOfflineProcedure>
const allOfflineProcedure = procedure
  .input(PaginateInputSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.offlineService.findMany(ctx.handle, input)
  })

export type FindOfflineInput = inferProcedureInput<typeof findOfflineProcedure>
export type FindOfflineOutput = inferProcedureOutput<typeof findOfflineProcedure>
const findOfflineProcedure = procedure
  .input(OfflineSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.offlineService.findById(ctx.handle, input)
  })

export type GetOfflineInput = inferProcedureInput<typeof getOfflineProcedure>
export type GetOfflineOutput = inferProcedureOutput<typeof getOfflineProcedure>
const getOfflineProcedure = procedure
  .input(OfflineSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.offlineService.getById(ctx.handle, input)
  })

export type CreateOfflineFileUploadInput = inferProcedureInput<typeof createOfflineFileUploadProcedure>
export type CreateOfflineFileUploadOutput = inferProcedureOutput<typeof createOfflineFileUploadProcedure>
const createOfflineFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    return ctx.offlineService.createFileUpload(ctx.handle, input.filename, input.contentType, ctx.principal.subject)
  })

export type CreateOfflineImageUploadInput = inferProcedureInput<typeof createOfflineImageUploadProcedure>
export type CreateOfflineImageUploadOutput = inferProcedureOutput<typeof createOfflineImageUploadProcedure>
const createOfflineImageUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    return ctx.offlineService.createImageUpload(ctx.handle, input.filename, input.contentType, ctx.principal.subject)
  })

export const offlineRouter = t.router({
  create: createOfflineProcedure,
  edit: editOfflineProcedure,
  all: allOfflineProcedure,
  find: findOfflineProcedure,
  get: getOfflineProcedure,
  createFileUpload: createOfflineFileUploadProcedure,
  createImageUpload: createOfflineImageUploadProcedure,
})
