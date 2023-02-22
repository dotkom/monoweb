import { z } from "zod"
import { t } from "../../trpc"
import { CompanyWriteSchema } from "@dotkomonline/types"

export const companyRouter = t.router({
  create: t.procedure.input(CompanyWriteSchema).mutation(({ input, ctx }) => {
    return ctx.companyService.createCompany(input)
  }),
  all: t.procedure
    .input(
      z.object({
        limit: z.number(),
        offset: z.number().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.companyService.getCompanies(input.limit, input.offset)
    }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.companyService.getCompany(input)
  }),
})
