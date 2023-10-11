import { z } from "zod"
import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "@dotkomonline/core"
import { companyEventRouter } from "./company-event-router"
import { protectedProcedure, t } from "../../trpc"

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
  get: t.procedure.input(z.string().uuid()).query(async ({ input, ctx }) => ctx.companyService.getCompany(input)),
  event: companyEventRouter,
})
