import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema } from "@dotkomonline/types"
import { z } from "zod"
import { publicProcedure, t } from "../../trpc"

export const companyEventRouter = t.router({
  get: publicProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        pagination: PaginateInputSchema,
      })
    )
    .query(({ input, ctx }) => {
      return ctx.companyEventService.getEventsByCompanyId(input.id, input.pagination.take, input.pagination.cursor)
    }),
})
