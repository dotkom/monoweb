import { BasePaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { permitIf } from "../../authorization"
import { InvalidArgumentError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { canCreateMark, canListAllMarks, canListMarks, canManageMark } from "../../permissions/mark-permissions"
import { intersectGroupAffiliations, toAffiliationSet } from "../../permissions/principal"
import { procedure, t } from "../../trpc"
import { GroupSchema } from "../group/group"
import { MarkFilterQuerySchema, MarkSchema, MarkWriteSchema } from "./mark"
import { personalMarkRouter } from "./personal-mark-router"

export type CreateMarkInput = inferProcedureInput<typeof createMarkProcedure>
export type CreateMarkOutput = inferProcedureOutput<typeof createMarkProcedure>
const createMarkProcedure = procedure
  .input(
    z.object({
      data: MarkWriteSchema,
      groupIds: GroupSchema.shape.slug.array(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canCreateMark(principal, input.groupIds))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const groups = await ctx.groupService.findManyByGroupSlugs(ctx.handle, input.groupIds)

    if (groups.some((group) => group.type === "EMAIL_ONLY")) {
      throw new InvalidArgumentError("Email-only groups cannot be used for marks")
    }

    const createdMark = await ctx.markService.create(ctx.handle, input.data, input.groupIds)

    ctx.setAuditTransactionName(`Create Mark(ID=${createdMark.id},Title=${createdMark.title})`)

    return createdMark
  })

export type EditMarkInput = inferProcedureInput<typeof editMarkProcedure>
export type EditMarkOutput = inferProcedureOutput<typeof editMarkProcedure>
const editMarkProcedure = procedure
  .input(
    z.object({
      changes: MarkWriteSchema.required({ id: true }),
      groupIds: GroupSchema.shape.slug.array(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.handle, input.changes.id)
    const currentGroupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, currentGroupIds, input.groupIds)),
      input
    )

    const groups = await ctx.groupService.findManyByGroupSlugs(ctx.handle, input.groupIds)

    if (groups.some((group) => group.type === "EMAIL_ONLY")) {
      throw new InvalidArgumentError("Email-only groups cannot be used for marks")
    }

    const updatedMark = await ctx.markService.update(ctx.handle, input.changes.id, input.changes, input.groupIds)

    ctx.setAuditTransactionName(`Update Mark(ID=${updatedMark.id},Title=${updatedMark.title})`)

    return updatedMark
  })

export type GetMarkInput = inferProcedureInput<typeof getMarkProcedure>
export type GetMarkOutput = inferProcedureOutput<typeof getMarkProcedure>
const getMarkProcedure = procedure
  .input(MarkSchema.shape.id)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.handle, input)
    const groupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, groupIds)),
      input
    )

    return mark
  })

export type FindMarksInput = inferProcedureInput<typeof findManyProcedure>
export type FindMarksOutput = inferProcedureOutput<typeof findManyProcedure>
const findManyProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: MarkFilterQuerySchema.optional() }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(
      permitIf((principal) => canListMarks(principal)),
      input
    )

    const { filter, ...page } = input

    const byGroupId = canListAllMarks(ctx.principal)
      ? filter?.byGroupId
      : [
          ...intersectGroupAffiliations(
            ctx.principal.affiliations,
            filter?.byGroupId ?? [...toAffiliationSet(ctx.principal.affiliations)]
          ),
        ]

    const marks = await ctx.markService.findMany(ctx.handle, { ...filter, byGroupId }, page)

    return {
      items: marks,
      nextCursor: marks.at(-1)?.id,
    }
  })

export type DeleteMarkInput = inferProcedureInput<typeof deleteMarkProcedure>
export type DeleteMarkOutput = inferProcedureOutput<typeof deleteMarkProcedure>
const deleteMarkProcedure = procedure
  .input(MarkSchema.shape.id)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.handle, input)
    const groupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, groupIds)),
      input
    )

    const deletedMark = await ctx.markService.delete(ctx.handle, input)

    ctx.setAuditTransactionName(`Delete Mark(ID=${deletedMark.id},Title=${deletedMark.title})`)

    return deletedMark
  })

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: createMarkProcedure,
  edit: editMarkProcedure,
  get: getMarkProcedure,
  findMany: findManyProcedure,
  delete: deleteMarkProcedure,
})
