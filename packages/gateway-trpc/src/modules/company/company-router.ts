import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, publicProcedure, t } from "../../trpc"
import { companyEventRouter } from "./company-event-router"

export const companyRouter = t.router({
  create: adminProcedure
    .input(CompanyWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.companyService.createCompany(input)),
  edit: adminProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        input: CompanyWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.companyService.updateCompany(changes.id, changes.input)),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.companyService.getCompanies(input)),
  getById: publicProcedure
    .input(CompanySchema.shape.id)
    .query(async ({ input, ctx }) => ctx.companyService.getCompanyById(input)),
  getBySlug: publicProcedure
    .input(CompanySchema.shape.slug)
    .query(async ({ input, ctx }) => ctx.companyService.getCompanyBySlug(input)),
  event: companyEventRouter,
})
