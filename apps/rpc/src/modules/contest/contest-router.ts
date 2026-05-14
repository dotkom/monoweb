import { ContestSchema, ContestUpdateSchema, ContestWriteSchema, ContestantSchema } from "./contest"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isCommitteeMember, or } from "../../authorization"
import { ForbiddenError, InvalidArgumentError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { PaginateInputSchema } from "@dotkomonline/utils"
import { procedure, t } from "../../trpc"
import { sanitizeContestantDetailsForPublic } from "./contest-service"

export type CreateContestInput = inferProcedureInput<typeof createContestProcedure>
export type CreateContestOutput = inferProcedureOutput<typeof createContestProcedure>
const createContestProcedure = procedure
  .input(z.object({ contest: ContestWriteSchema }))
  .use(withAuthentication())
  .use(withAuthorization(or(isCommitteeMember(), isAdministrator())))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const allowedGroupSlugs = ctx.authorizationService.intersectGroupAffiliations(
      ctx.principal.affiliations,
      input.contest.groups
    )

    if (allowedGroupSlugs.size === 0) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to create a contest with input groups (${input.contest.groups.join(", ")})`
      )
    }

    const groups = await ctx.groupService.findManyByGroupSlugs(ctx.handle, input.contest.groups)

    if (groups.some((group) => group.type === "EMAIL_ONLY")) {
      throw new InvalidArgumentError("Email-only groups cannot be used as organizers for contests")
    }

    return ctx.contestService.create(ctx.handle, { ...input.contest, groups: [...allowedGroupSlugs] })
  })

export type UpdateContestInput = inferProcedureInput<typeof updateContestProcedure>
export type UpdateContestOutput = inferProcedureOutput<typeof updateContestProcedure>
const updateContestProcedure = procedure
  .input(
    z.object({
      contestId: ContestSchema.shape.id,
      contest: ContestUpdateSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const [contest, fetchedGroups] = await Promise.all([
      ctx.contestService.getById(ctx.handle, input.contestId),
      input.contest.groups !== undefined
        ? ctx.groupService.findManyByGroupSlugs(ctx.handle, input.contest.groups)
        : Promise.resolve(undefined),
    ])

    let sanitizedInput = input.contest

    if (input.contest.groups !== undefined) {
      const allowedGroupSlugs = ctx.authorizationService.intersectGroupAffiliations(
        ctx.principal.affiliations,
        input.contest.groups
      )

      if (allowedGroupSlugs.size === 0) {
        throw new ForbiddenError(
          `User(ID=${ctx.principal.subject}) is not authorized to update Contest(ID=${input.contestId}) with input groups (${input.contest.groups.join(", ")})`
        )
      }

      if (fetchedGroups?.some((group) => group.type === "EMAIL_ONLY")) {
        throw new InvalidArgumentError("Email-only groups cannot be used as organizers for contests")
      }

      sanitizedInput = {
        ...input.contest,
        groups: [...allowedGroupSlugs],
      }
    }

    const effectiveGroupSlugs = sanitizedInput.groups ?? contest.groups

    if (!ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, effectiveGroupSlugs)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to update Contest(ID=${input.contestId})`
      )
    }

    return ctx.contestService.update(ctx.handle, input.contestId, sanitizedInput)
  })

export type DeleteContestInput = inferProcedureInput<typeof deleteContestProcedure>
export type DeleteContestOutput = inferProcedureOutput<typeof deleteContestProcedure>
const deleteContestProcedure = procedure
  .input(
    z.object({
      contestId: ContestSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)

    if (!ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, contest.groups)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to delete Contest(ID=${input.contestId})`
      )
    }

    return ctx.contestService.delete(ctx.handle, input.contestId)
  })

export type GetContestByIdInput = inferProcedureInput<typeof getContestByIdProcedure>
export type GetContestByIdOutput = inferProcedureOutput<typeof getContestByIdProcedure>
const getContestByIdProcedure = procedure
  .input(z.object({ contestId: ContestSchema.shape.id }))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.contestService.getById(ctx.handle, input.contestId)
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
      data: z.object({
        contestantId: ContestantSchema.shape.id.nullable(),
      }),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)

    if (!ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, contest.groups)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to set winner for Contest(ID=${input.contestId})`
      )
    }

    return ctx.contestService.setWinner(ctx.handle, input.contestId, input.data.contestantId)
  })

export type AddContestantInput = inferProcedureInput<typeof addContestantProcedure>
export type AddContestantOutput = inferProcedureOutput<typeof addContestantProcedure>
const addContestantProcedure = procedure
  .input(
    z.object({
      contestId: ContestantSchema.shape.contestId,
      data: z
        .object({
          userId: ContestantSchema.shape.userId.unwrap(),
        })
        .or(
          z.object({
            teamName: z.string(),
            memberIds: z.string().array().min(1),
          })
        ),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)

    if (!ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, contest.groups)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to add contestants to Contest(ID=${input.contestId})`
      )
    }

    if ("teamName" in input.data) {
      return ctx.contestService.addTeamContestant(
        ctx.handle,
        input.contestId,
        input.data.teamName,
        input.data.memberIds
      )
    }

    return ctx.contestService.addUserContestant(ctx.handle, input.contestId, input.data.userId)
  })

export type RemoveContestantInput = inferProcedureInput<typeof removeContestantProcedure>
export type RemoveContestantOutput = inferProcedureOutput<typeof removeContestantProcedure>
const removeContestantProcedure = procedure
  .input(
    z.object({
      contestantId: ContestantSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.contestService.getContestantById(ctx.handle, input.contestantId)
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)

    if (!ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, contest.groups)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to remove contestants from Contest(ID=${contest.id})`
      )
    }

    return ctx.contestService.removeContestant(ctx.handle, input.contestantId)
  })

export type UpdateContestantResultInput = inferProcedureInput<typeof updateContestantResultProcedure>
export type UpdateContestantResultOutput = inferProcedureOutput<typeof updateContestantResultProcedure>
const updateContestantResultProcedure = procedure
  .input(
    z.object({
      contestantId: ContestantSchema.shape.id,
      data: z.object({
        resultValue: z.number().int().nullable(),
      }),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.contestService.getContestantById(ctx.handle, input.contestantId)
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)

    if (!ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, contest.groups)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to update results for Contest(ID=${contest.id})`
      )
    }

    return ctx.contestService.updateContestantResult(ctx.handle, input.contestantId, input.data.resultValue)
  })

export type UpdateTeamContestantInput = inferProcedureInput<typeof updateTeamContestantProcedure>
export type UpdateTeamContestantOutput = inferProcedureOutput<typeof updateTeamContestantProcedure>
const updateTeamContestantProcedure = procedure
  .input(
    z
      .object({
        contestantId: ContestantSchema.shape.id,
        data: z.object({
          teamName: z.string().min(1).optional(),
          memberIds: z.array(z.string()).min(1).optional(),
        }),
      })
      .refine((input) => input.data.teamName !== undefined || input.data.memberIds !== undefined, {
        message: "At least one of teamName or memberIds must be provided",
      })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.contestService.getContestantById(ctx.handle, input.contestantId)
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)

    if (!ctx.authorizationService.hasAnyGroupAffiliation(ctx.principal.affiliations, contest.groups)) {
      throw new ForbiddenError(
        `User(ID=${ctx.principal.subject}) is not authorized to update team contestants for Contest(ID=${contest.id})`
      )
    }

    return ctx.contestService.updateTeamContestant(ctx.handle, input.contestantId, {
      teamName: input.data.teamName,
      memberIds: input.data.memberIds,
    })
  })

export type GetContestWithContestantsInput = inferProcedureInput<typeof getContestWithContestantsProcedure>
export type GetContestWithContestantsOutput = inferProcedureOutput<typeof getContestWithContestantsProcedure>
const getContestWithContestantsProcedure = procedure
  .input(z.object({ contestId: ContestSchema.shape.id }))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const isAuthenticated = ctx.principal !== null

    let { contest, contestants } = await ctx.contestService.getContestWithContestants(ctx.handle, input.contestId)

    if (!isAuthenticated) {
      contestants = sanitizeContestantDetailsForPublic(contestants)
    }

    return { contest, contestants }
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
    updateTeam: updateTeamContestantProcedure,
  }),
})
