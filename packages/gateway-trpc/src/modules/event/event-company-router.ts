import { CompanySchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const eventCompanyRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventCompanyService.createCompany(handle, input.id, input.company))
    ),
  delete: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventCompanyService.deleteCompany(handle, input.id, input.company))
    ),
  get: publicProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventCompanyService.getCompaniesByEventId(handle, input.id))
    ),
})
