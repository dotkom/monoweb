import { CompanySchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const eventCompanyRouter = t.router({
  create: authenticatedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireSignIn()
      return ctx.executeTransaction(async (handle) =>
        ctx.eventCompanyService.createCompany(handle, input.id, input.company)
      )
    }),

  delete: authenticatedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CompanySchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireSignIn()
      return ctx.executeTransaction(async (handle) =>
        ctx.eventCompanyService.deleteCompany(handle, input.id, input.company)
      )
    }),

  get: procedure
    .input(
      z.object({
        id: EventSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventCompanyService.getCompaniesByEventId(handle, input.id))
    ),
})
