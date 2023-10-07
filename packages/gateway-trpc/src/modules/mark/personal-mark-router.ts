import { PaginateInputSchema } from "@dotkomonline/core";
import { z } from "zod";

import { protectedProcedure, t } from "../../trpc";

export const personalMarkRouter = t.router({
  addToUser: protectedProcedure
    .input(z.object({ markId: z.string().uuid(), userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => ctx.personalMarkService.addPersonalMarkToUserId(input.userId, input.markId)),
  getByUser: protectedProcedure
    .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
    .query(async ({ ctx, input }) =>
      ctx.personalMarkService.getPersonalMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  getExpiryDateForUser: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => ctx.personalMarkService.getExpiryDateForUserId(input)),
  removeFromUser: protectedProcedure
    .input(z.object({ markId: z.string().uuid(), userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) =>
      ctx.personalMarkService.removePersonalMarkFromUserId(input.userId, input.markId)
    ),
});
