import type { DBHandle } from "@dotkomonline/db"
import { PaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { InvalidArgumentError } from "../../error"
import { withAuditLogEntry, withAuthentication, withDatabaseTransaction } from "../../middlewares"
import { canCreateContest, canManageContest } from "../../permissions/contest-permissions"
import { procedure, t, type TRPCContext } from "../../trpc"
import { GroupTypeSchema, type GroupId } from "../group/group"
import type { GroupService } from "../group/group-service"
import { ContestSchema, ContestUpdateSchema, ContestWriteSchema, ContestantSchema } from "./contest"
import { sanitizeContestantDetailsForPublic } from "./contest-service"

// TODO: Business rule inside router
function assertNoEmailOnlyOrganizers(groups: readonly { type: string }[]): void {
  if (groups.some((group) => group.type === GroupTypeSchema.enum.EMAIL_ONLY)) {
    throw new InvalidArgumentError("Email-only groups cannot be used as organizers for contests")
  }
}

async function authorizeManageContest<TInput>(
  ctx: {
    handle: DBHandle
    groupService: GroupService
    addAuthorizationGuard: TRPCContext["addAuthorizationGuard"]
  },
  input: TInput,
  previousGroupIds: GroupId[],
  nextGroupIds: GroupId[] = previousGroupIds
): Promise<void> {
  const previousOrganizers = await ctx.groupService.findManyByGroupSlugs(ctx.handle, previousGroupIds)
  const nextOrganizers =
    nextGroupIds === previousGroupIds
      ? previousOrganizers
      : await ctx.groupService.findManyByGroupSlugs(ctx.handle, nextGroupIds)

  await ctx.addAuthorizationGuard(
    permitIf((principal) => canManageContest(principal, previousOrganizers, nextOrganizers)),
    input
  )
}

export type CreateContestInput = inferProcedureInput<typeof createContestProcedure>
export type CreateContestOutput = inferProcedureOutput<typeof createContestProcedure>
const createContestProcedure = procedure
  .input(z.object({ contest: ContestWriteSchema }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const groups = await ctx.groupService.findManyByGroupSlugs(ctx.handle, input.contest.groups)
    assertNoEmailOnlyOrganizers(groups)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canCreateContest(principal, groups)),
      input
    )

    const createdContest = await ctx.contestService.create(ctx.handle, input.contest)

    ctx.setAuditTransactionName(`Create Contest(ID=${createdContest.id},Name=${createdContest.name})`)

    return createdContest
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)
    const nextGroupIds = input.contest.groups ?? contest.groups

    const previousOrganizers = await ctx.groupService.findManyByGroupSlugs(ctx.handle, contest.groups)
    const nextOrganizers =
      nextGroupIds === contest.groups
        ? previousOrganizers
        : await ctx.groupService.findManyByGroupSlugs(ctx.handle, nextGroupIds)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageContest(principal, previousOrganizers, nextOrganizers)),
      input
    )

    assertNoEmailOnlyOrganizers(nextOrganizers)

    const updatedContest = await ctx.contestService.update(ctx.handle, input.contestId, input.contest)

    ctx.setAuditTransactionName(`Update Contest(ID=${updatedContest.id},Name=${updatedContest.name})`)

    return updatedContest
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)

    await authorizeManageContest(ctx, input, contest.groups)

    await ctx.contestService.delete(ctx.handle, input.contestId)

    ctx.setAuditTransactionName(`Delete Contest(ID=${contest.id},Name=${contest.name})`)

    return contest
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)

    await authorizeManageContest(ctx, input, contest.groups)

    const updatedContest = await ctx.contestService.setWinner(ctx.handle, input.contestId, input.data.contestantId)

    const auditTransactionName =
      input.data.contestantId !== null
        ? `Set Winner for Contest(ID=${contest.id},Name=${contest.name}) to Contestant(ID=${input.data.contestantId})`
        : `Remove Winner from Contest(ID=${contest.id},Name=${contest.name})`

    ctx.setAuditTransactionName(auditTransactionName)

    return updatedContest
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contest = await ctx.contestService.getById(ctx.handle, input.contestId)

    await authorizeManageContest(ctx, input, contest.groups)

    if ("teamName" in input.data) {
      const addedTeamContestant = await ctx.contestService.addTeamContestant(
        ctx.handle,
        input.contestId,
        input.data.teamName,
        input.data.memberIds
      )

      ctx.setAuditTransactionName(
        `Add Contestant(ID=${addedTeamContestant.id},TeamName=${input.data.teamName}) to Contest(ID=${contest.id},Name=${contest.name})`
      )

      return addedTeamContestant
    }

    const addedUserContestant = await ctx.contestService.addUserContestant(
      ctx.handle,
      input.contestId,
      input.data.userId
    )
    const user = await ctx.userService.getById(ctx.handle, input.data.userId)

    ctx.setAuditTransactionName(
      `Add Contestant(ID=${addedUserContestant.id},Name=${user.name}) to Contest(ID=${contest.id},Name=${contest.name})`
    )

    return addedUserContestant
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.contestService.getContestantById(ctx.handle, input.contestantId)
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)

    await authorizeManageContest(ctx, input, contest.groups)

    await ctx.contestService.removeContestant(ctx.handle, input.contestantId)

    ctx.setAuditTransactionName(
      `Remove Contestant(ID=${contestant.id}) from Contest(ID=${contest.id},Name=${contest.name})`
    )

    return contestant
  })

export type UpdateContestantResultInput = inferProcedureInput<typeof updateContestantResultProcedure>
export type UpdateContestantResultOutput = inferProcedureOutput<typeof updateContestantResultProcedure>
const updateContestantResultProcedure = procedure
  .input(
    z.object({
      contestantId: ContestantSchema.shape.id,
      data: z.object({
        resultValue: z.int().nullable(),
      }),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.contestService.getContestantById(ctx.handle, input.contestantId)
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)

    await authorizeManageContest(ctx, input, contest.groups)

    const updatedContestantResult = await ctx.contestService.updateContestantResult(
      ctx.handle,
      input.contestantId,
      input.data.resultValue
    )

    ctx.setAuditTransactionName(
      `Update Contestant(ID=${updatedContestantResult.id}) result for Contest(ID=${contest.id},Name=${contest.name})`
    )

    return updatedContestantResult
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
        error: "At least one of teamName or memberIds must be provided",
      })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const contestant = await ctx.contestService.getContestantById(ctx.handle, input.contestantId)
    const contest = await ctx.contestService.getById(ctx.handle, contestant.contestId)

    await authorizeManageContest(ctx, input, contest.groups)

    const updatedTeamContestant = await ctx.contestService.updateTeamContestant(ctx.handle, input.contestantId, {
      teamName: input.data.teamName,
      memberIds: input.data.memberIds,
    })

    const teamNameAuditLogText = input.data.teamName !== undefined ? `,TeamName=${input.data.teamName}` : ""

    ctx.setAuditTransactionName(
      `Update Contestant(ID=${updatedTeamContestant.id}${teamNameAuditLogText}) for Contest(ID=${contest.id},Name=${contest.name})`
    )

    return updatedTeamContestant
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
