import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"
import { CompanySchema, CompanyWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "@dotkomonline/core"
import { companyEventRouter } from "./company-event-router"

export const companyRouter = t.router({
  create: t.procedure.input(CompanyWriteSchema).mutation(({ input, ctx }) => {
    return ctx.companyService.createCompany(input)
  }),
  edit: protectedProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        input: CompanyWriteSchema,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.companyService.updateCompany(changes.id, changes.input)
    }),
  all: t.procedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.companyService.getCompanies(input.take, input.cursor)
  }),
  get: t.procedure.input(CompanySchema.shape.id).query(({ input, ctx }) => {
    return ctx.companyService.getCompany(input)
  }),
  event: companyEventRouter,
})
