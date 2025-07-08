import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, publicProcedure, t } from "../../trpc"
import { companyEventRouter } from "./company-event-router"

export const companyRouter = t.router({
  create: adminProcedure
    .input(CompanyWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.createCompany(handle, input))
    ),
  edit: adminProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        input: CompanyWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.updateCompany(handle, changes.id, changes.input))
    ),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getCompanies(handle, input))
    ),
  getById: publicProcedure
    .input(CompanySchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getCompanyById(handle, input))
    ),
  getBySlug: publicProcedure
    .input(CompanySchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.companyService.getCompanyBySlug(handle, input))
    ),
  event: companyEventRouter,
})
