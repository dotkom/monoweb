import { GroupSchema, MarkFilterQuerySchema, MarkSchema, MarkWriteSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"
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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => ctx.markService.create(ctx.handle, input.data, input.groupIds))

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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) =>
    ctx.markService.update(ctx.handle, input.changes.id, input.changes, input.groupIds)
  )

export type GetMarkInput = inferProcedureInput<typeof getMarkProcedure>
export type GetMarkOutput = inferProcedureOutput<typeof getMarkProcedure>
const getMarkProcedure = procedure
  .input(MarkSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.markService.getById(ctx.handle, input))

export type FindMarksInput = inferProcedureInput<typeof findManyProcedure>
export type FindMarksOutput = inferProcedureOutput<typeof findManyProcedure>
const findManyProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: MarkFilterQuerySchema.optional() }))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input

    const marks = await ctx.markService.findMany(ctx.handle, { ...filter }, page)

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
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => ctx.markService.delete(ctx.handle, input))

export const markRouter = t.router({
  personal: personalMarkRouter,
  create: createMarkProcedure,
  edit: editMarkProcedure,
  get: getMarkProcedure,
  findMany: findManyProcedure,
  delete: deleteMarkProcedure,
})
