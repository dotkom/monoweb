import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"
import { CompanyWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "@dotkomonline/core"
import { companyEventRouter } from "./company-event-router"

export const companyRouter = t.router({
  create: t.procedure.input(CompanyWriteSchema).mutation(({ input, ctx }) => {
    return ctx.companyService.createCompany(input)
  }),
  edit: protectedProcedure
    .input(
      CompanyWriteSchema.required({
        id: true,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.companyService.updateCompany(changes.id, changes)
    }),
  all: t.procedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.companyService.getCompanies(input.take, input.cursor)
  }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.companyService.getCompany(input)
  }),
  event: companyEventRouter,
})
