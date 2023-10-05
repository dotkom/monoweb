import { CompanySchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { PaginateInputSchema } from "@dotkomonline/core"

export const companyEventRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        event: EventSchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.companyEventService.createEvent(input.id, input.event)
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: CompanySchema.shape.id,
        event: EventSchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.companyEventService.deleteEvent(input.id, input.event)
    }),
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
