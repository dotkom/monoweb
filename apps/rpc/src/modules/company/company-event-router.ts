import { CompanySchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"

export const companyEventRouter = t.router({
  get: procedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        pagination: PaginateInputSchema,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.companyEventService.getAttendanceEventsByCompanyId(handle, input.id, input.pagination)
      })
    ),
})
