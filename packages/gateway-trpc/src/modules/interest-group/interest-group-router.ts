import {
  InterestGroupSchema,
  InterestGroupWriteSchema,
} from "@dotkomonline/types";
import { protectedProcedure, publicProcedure, t } from "../../trpc";
import { PaginateInputSchema } from "@dotkomonline/core";

export const interestGroupRouter = t.router({
  create: protectedProcedure
    .input(InterestGroupWriteSchema)
    .mutation(
      async ({ input, ctx }) => await ctx.interestGroupService.create(input)
    ),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getAll()),
  get: publicProcedure
    .input(InterestGroupSchema.shape.id)
    .query(
      async ({ input, ctx }) => await ctx.interestGroupService.getById(input)
    ),
});
