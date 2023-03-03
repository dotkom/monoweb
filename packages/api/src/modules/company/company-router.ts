import { z } from "zod"
import { t } from "../../trpc"
import { CompanyWriteSchema } from "@dotkomonline/types"
import { CursorSchema } from "@/utils/db-utils"

export const companyRouter = t.router({
  create: t.procedure.input(CompanyWriteSchema).mutation(({ input, ctx }) => {
    return ctx.companyService.createCompany(input)
  }),
  all: t.procedure
    .input(
      z.object({
        take: z.number().positive().default(20),
        cursor: CursorSchema.optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.companyService.getCompanies(input.take, input.cursor)
    }),
  get: t.procedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.companyService.getCompany(input)
  }),
})
