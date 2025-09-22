import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"

export const companyRouter = t.router({
  create: staffProcedure.input(CompanyWriteSchema).mutation(async ({ input, ctx }) => {
    return ctx.executeAuditedTransaction(async (handle) => ctx.companyService.createCompany(handle, input))
  }),

  edit: staffProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        input: CompanyWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
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
