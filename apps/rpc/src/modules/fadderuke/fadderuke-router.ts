import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isGroupMember, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { FadderukeSchema, FadderukeWriteSchema } from "./fadderuke"
import { CommitteeGroupSlug } from "../authorization-service"

export type FindFadderukeByYearInput = inferProcedureInput<typeof findByYearProcedure>
export type FindFadderukeByYearOutput = inferProcedureOutput<typeof findByYearProcedure>
const findByYearProcedure = procedure
  .input(z.int())
  .output(FadderukeSchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.fadderukeService.findByYear(ctx.handle, input)
  })

export type FindManyFadderukerOutput = inferProcedureOutput<typeof findManyProcedure>
const findManyProcedure = procedure
  .output(FadderukeSchema.array())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return ctx.fadderukeService.findMany(ctx.handle)
  })

export type GetFadderukeByIdInput = inferProcedureInput<typeof getByIdProcedure>
export type GetFadderukeByIdOutput = inferProcedureOutput<typeof getByIdProcedure>
const getByIdProcedure = procedure
  .input(FadderukeSchema.shape.id)
  .output(FadderukeSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.fadderukeService.getById(ctx.handle, input)
  })

export type CreateFadderukeInput = inferProcedureInput<typeof createProcedure>
export type CreateFadderukeOutput = inferProcedureOutput<typeof createProcedure>
const createProcedure = procedure
  .input(z.object({ fadderuke: FadderukeWriteSchema }))
  .output(FadderukeSchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.VELKOM))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdFadderuke = await ctx.fadderukeService.create(ctx.handle, input.fadderuke)

    ctx.setAuditTransactionName(`Create Fadderuke(ID=${createdFadderuke.id},Year=${createdFadderuke.year})`)

    return createdFadderuke
  })

export type UpdateFadderukeInput = inferProcedureInput<typeof updateProcedure>
export type UpdateFadderukeOutput = inferProcedureOutput<typeof updateProcedure>
const updateProcedure = procedure
  .input(z.object({ fadderukeId: FadderukeSchema.shape.id, fadderuke: FadderukeWriteSchema.partial() }))
  .output(FadderukeSchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.VELKOM))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const updatedFadderuke = await ctx.fadderukeService.update(ctx.handle, input.fadderukeId, input.fadderuke)

    ctx.setAuditTransactionName(`Update Fadderuke(ID=${updatedFadderuke.id},Year=${updatedFadderuke.year})`)

    return updatedFadderuke
  })

export type DeleteFadderukeInput = inferProcedureInput<typeof deleteProcedure>
export type DeleteFadderukeOutput = inferProcedureOutput<typeof deleteProcedure>
const deleteProcedure = procedure
  .input(z.object({ fadderukeId: FadderukeSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(CommitteeGroupSlug.VELKOM))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const deletedFadderuke = await ctx.fadderukeService.delete(ctx.handle, input.fadderukeId)

    ctx.setAuditTransactionName(`Delete Fadderuke(ID=${deletedFadderuke.id},Year=${deletedFadderuke.year})`)

    return input.fadderukeId
  })

export const fadderukeRouter = t.router({
  findByYear: findByYearProcedure,
  findMany: findManyProcedure,
  getById: getByIdProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
})
