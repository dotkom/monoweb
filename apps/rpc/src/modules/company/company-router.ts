import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const companyRouter = t.router({
  create: authenticatedProcedure.input(CompanyWriteSchema).mutation(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation()
    return ctx.executeTransaction(async (handle) => ctx.companyService.createCompany(handle, input))
  }),

  edit: authenticatedProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        input: CompanyWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => {
      ctx.authorize.requireAffiliation()
      return ctx.executeTransaction(async (handle) =>
        ctx.companyService.updateCompany(handle, changes.id, changes.input)
      )
    }),

  all: procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getCompanies(handle, input))
    ),

  getById: procedure
    .input(CompanySchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getCompanyById(handle, input))
    ),

  getBySlug: procedure
    .input(CompanySchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getCompanyBySlug(handle, input))
    ),
})
