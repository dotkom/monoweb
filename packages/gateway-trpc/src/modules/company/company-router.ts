import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"
import { companyEventRouter } from "./company-event-router"

export const companyRouter = t.router({
  create: t.procedure
    .input(CompanyWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.companyService.createCompany(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        input: CompanyWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.companyService.updateCompany(changes.id, changes.input)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.companyService.getCompanies(input.take, input.cursor)),
  get: t.procedure.input(CompanySchema.shape.id).query(async ({ input, ctx }) => ctx.companyService.getCompany(input)),
  event: companyEventRouter,
})
