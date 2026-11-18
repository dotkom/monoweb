import { z } from "zod"
import { permitIf } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { canManageFadderuker } from "../../permissions/fadderuke-permissions"
import { procedure, t } from "../../trpc"
import { FadderukeSchema, FadderukeWriteSchema } from "./fadderuke"

const findByYearProcedure = procedure
  .input(z.int())
  .output(FadderukeSchema.nullable())
  .query(async ({ input, ctx }) => {
    return ctx.fadderukeService.findByYear(ctx.prisma, input)
  })

const findManyProcedure = procedure.output(FadderukeSchema.array()).query(async ({ ctx }) => {
  return ctx.fadderukeService.findMany(ctx.prisma)
})

const getByIdProcedure = procedure
  .input(FadderukeSchema.shape.id)
  .output(FadderukeSchema)
  .query(async ({ input, ctx }) => {
    return ctx.fadderukeService.getById(ctx.prisma, input)
  })

const createProcedure = procedure
  .input(z.object({ fadderuke: FadderukeWriteSchema }))
  .output(FadderukeSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageFadderuker)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdFadderuke = await ctx.fadderukeService.create(ctx.handle, input.fadderuke)

    ctx.setAuditTransactionName(`Create Fadderuke(ID=${createdFadderuke.id},Year=${createdFadderuke.year})`)

    return createdFadderuke
  })

const updateProcedure = procedure
  .input(z.object({ fadderukeId: FadderukeSchema.shape.id, fadderuke: FadderukeWriteSchema.partial() }))
  .output(FadderukeSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageFadderuker)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const updatedFadderuke = await ctx.fadderukeService.update(ctx.handle, input.fadderukeId, input.fadderuke)

    ctx.setAuditTransactionName(`Update Fadderuke(ID=${updatedFadderuke.id},Year=${updatedFadderuke.year})`)

    return updatedFadderuke
  })

const deleteProcedure = procedure
  .input(z.object({ fadderukeId: FadderukeSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageFadderuker)))
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
