import { ContestSchema, ContestUpdateSchema, ContestWriteSchema, ContestantSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isCommitteeMember } from "../../authorization"
import { ForbiddenError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { PaginateInputSchema } from "@dotkomonline/utils"
import { procedure, t } from "../../trpc"

export type CreateContestInput = inferProcedureInput<typeof createContestProcedure>
export type CreateContestOutput = inferProcedureOutput<typeof createContestProcedure>
const createContestProcedure = procedure
  .input(ContestWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [
      input.groupId,
    ])
    if (allowedGroups.size === 0) {
      throw new ForbiddenError(`User(ID=${ctx.principal.subject}) is not a member of Group(ID=${input.groupId})`)
    }
    return ctx.contestService.create(ctx.handle, input)
  })

export type UpdateContestInput = inferProcedureInput<typeof updateContestProcedure>
export type UpdateContestOutput = inferProcedureOutput<typeof updateContestProcedure>
const updateContestProcedure = procedure
  .input(
    z.object({
      id: ContestSchema.shape.id,
      input: ContestUpdateSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.id)
    const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [
      contest.groupId,
    ])
    if (allowedGroups.size === 0) {
      throw new ForbiddenError(`User(ID=${ctx.principal.subject}) is not authorized to update Contest(ID=${input.id})`)
    }
    return ctx.contestService.update(ctx.handle, input.id, input.input)
  })

export type DeleteContestInput = inferProcedureInput<typeof deleteContestProcedure>
export type DeleteContestOutput = inferProcedureOutput<typeof deleteContestProcedure>
const deleteContestProcedure = procedure
  .input(
    z.object({
      id: ContestSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.id)
    const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [
      contest.groupId,
    ])
    if (allowedGroups.size === 0) {
      throw new ForbiddenError(`User(ID=${ctx.principal.subject}) is not authorized to delete Contest(ID=${input.id})`)
    }
    return ctx.contestService.delete(ctx.handle, input.id)
  })

export type GetContestByIdInput = inferProcedureInput<typeof getContestByIdProcedure>
export type GetContestByIdOutput = inferProcedureOutput<typeof getContestByIdProcedure>
const getContestByIdProcedure = procedure
  .input(ContestSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.contestService.getById(ctx.handle, input)
  })

export type FindManyContestsInput = inferProcedureInput<typeof findManyContestsProcedure>
export type FindManyContestsOutput = inferProcedureOutput<typeof findManyContestsProcedure>
const findManyContestsProcedure = procedure
  .input(PaginateInputSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.contestService.findMany(ctx.handle, input)
  })

export type SetWinnerInput = inferProcedureInput<typeof setWinnerProcedure>
export type SetWinnerOutput = inferProcedureOutput<typeof setWinnerProcedure>
const setWinnerProcedure = procedure
  .input(
    z.object({
      contestId: ContestSchema.shape.id,
      contestantId: ContestantSchema.shape.id.nullable(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)
    const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [
      contest.groupId,
    ])
    if (allowedGroups.size === 0) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to set winner for Contest(ID=${input.contestId})`
      )
    }
    return ctx.contestService.setWinner(ctx.handle, input.contestId, input.contestantId)
  })

export type AddContestantInput = inferProcedureInput<typeof addContestantProcedure>
export type AddContestantOutput = inferProcedureOutput<typeof addContestantProcedure>
const addContestantProcedure = procedure
  .input(
    z.object({
      contestId: ContestantSchema.shape.contestId,
      userId: ContestantSchema.shape.userId,
      teamName: z.string().optional(),
      memberIds: z.array(z.string()).optional(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)
    const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [
      contest.groupId,
    ])
    if (allowedGroups.size === 0) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to add contestants to Contest(ID=${input.contestId})`
      )
    }
    return ctx.contestService.addContestant(
      ctx.handle,
      { contestId: input.contestId, userId: input.userId, resultValue: null },
      input.teamName,
      input.memberIds
    )
  })

export type RemoveContestantInput = inferProcedureInput<typeof removeContestantProcedure>
export type RemoveContestantOutput = inferProcedureOutput<typeof removeContestantProcedure>
const removeContestantProcedure = procedure
  .input(
    z.object({
      id: ContestantSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.handle.contestant.findUniqueOrThrow({ where: { id: input.id } })
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)
    const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [
      contest.groupId,
    ])
    if (allowedGroups.size === 0) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to remove contestants from Contest(ID=${contest.id})`
      )
    }
    return ctx.contestService.removeContestant(ctx.handle, input.id)
  })

export type UpdateContestantResultInput = inferProcedureInput<typeof updateContestantResultProcedure>
export type UpdateContestantResultOutput = inferProcedureOutput<typeof updateContestantResultProcedure>
const updateContestantResultProcedure = procedure
  .input(
    z.object({
      id: ContestantSchema.shape.id,
      resultValue: z.number().int().nullable(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.handle.contestant.findUniqueOrThrow({ where: { id: input.id } })
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)
    const allowedGroups = ctx.authorizationService.intersectGroupAffiliations(ctx.principal.affiliations, [
      contest.groupId,
    ])
    if (allowedGroups.size === 0) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to update results for Contest(ID=${contest.id})`
      )
    }
    return ctx.contestService.updateContestantResult(ctx.handle, input.id, input.resultValue)
  })

export type GetContestWithContestantsInput = inferProcedureInput<typeof getContestWithContestantsProcedure>
export type GetContestWithContestantsOutput = inferProcedureOutput<typeof getContestWithContestantsProcedure>
const getContestWithContestantsProcedure = procedure
  .input(ContestSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.contestService.getContestWithContestants(ctx.handle, input)
  })

export const contestRouter = t.router({
  create: createContestProcedure,
  update: updateContestProcedure,
  delete: deleteContestProcedure,
  getById: getContestByIdProcedure,
  findMany: findManyContestsProcedure,
  setWinner: setWinnerProcedure,
  getWithContestants: getContestWithContestantsProcedure,
  contestant: t.router({
    add: addContestantProcedure,
    remove: removeContestantProcedure,
    updateResult: updateContestantResultProcedure,
  }),
})
