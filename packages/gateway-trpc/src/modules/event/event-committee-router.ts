import { PaginateInputSchema } from "@dotkomonline/core"
import { CommitteeSchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const eventCommitteeRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        committee: CommitteeSchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventCommitteeService.createCommittee(input.id, input.committee)
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        committee: CommitteeSchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventCommitteeService.deleteCommittee(input.id, input.committee)
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
