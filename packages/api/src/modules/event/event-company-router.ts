import { CompanySchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { PaginateInputSchema } from "../../utils/db-utils"

export const eventCompanyRouter = t.router({
  add: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventCompanyService.createCompany(input.id, input.company)
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventCompanyService.deleteCompany(input.id, input.company)
    }),
  get: publicProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        pagination: PaginateInputSchema,
      })
    )
    .query(({ input, ctx }) => {
      return ctx.eventCompanyService.getCompaniesByEventId(input.id, input.pagination.take, input.pagination.cursor)
    }),
})
