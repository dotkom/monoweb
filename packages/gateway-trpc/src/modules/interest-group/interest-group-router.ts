import { InterestGroupSchema, InterestGroupWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { PaginateInputSchema } from "@dotkomonline/core"
import { z } from "zod"

export const interestGroupRouter = t.router({
  create: protectedProcedure
    .input(InterestGroupWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.create(input)),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getAll(input)),
  get: publicProcedure
    .input(InterestGroupSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getById(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: InterestGroupSchema.shape.id,
        values: InterestGroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.update(input.id, input.values)),
  delete: protectedProcedure
    .input(InterestGroupSchema.shape.id)
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.delete(input)),
})
