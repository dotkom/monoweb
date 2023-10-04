import { PaginateInputSchema } from "@dotkomonline/core"
import { CommitteeSchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const eventCommitteeRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CommitteeSchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventCompanyService.createCompany(input.id, input.company)
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        company: CommitteeSchema.shape.id,
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
      return ctx.eventCommitteeService.getCommitteeByEventId(input.id, input.pagination.take, input.pagination.cursor)
    }),
})
