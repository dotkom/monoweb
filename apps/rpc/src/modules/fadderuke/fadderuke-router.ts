import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isGroupMember, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { FadderukeSchema, FadderukeWriteSchema } from "./fadderuke"
import {
  FadderukeContestProfileProgressStatusSchema,
  getFadderukeContestProfileProgressStatusForUser,
} from "./fadderuke-contest-profile-progress"
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

export type GetMyContestProfileProgressOutput = inferProcedureOutput<typeof getMyContestProfileProgressProcedure>
const getMyContestProfileProgressProcedure = procedure
  .output(FadderukeContestProfileProgressStatusSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return getFadderukeContestProfileProgressStatusForUser(ctx.handle, ctx.principal.subject)
  })

export type FindManyFadderukerOutput = inferProcedureOutput<typeof findManyProcedure>
const findManyProcedure = procedure
  .output(FadderukeSchema.array())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return ctx.fadderukeService.findMany(ctx.handle)
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
    return ctx.fadderukeService.create(ctx.handle, input.fadderuke)
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
    return ctx.fadderukeService.update(ctx.handle, input.fadderukeId, input.fadderuke)
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
    await ctx.fadderukeService.delete(ctx.handle, input.fadderukeId)
  })

export const fadderukeRouter = t.router({
  findByYear: findByYearProcedure,
  getMyContestProfileProgress: getMyContestProfileProgressProcedure,
  findMany: findManyProcedure,
  create: createProcedure,
  update: updateProcedure,
  delete: deleteProcedure,
})
