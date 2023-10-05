import { protectedProcedure, t } from "../../trpc";

import { PaginateInputSchema } from "@dotkomonline/core";
import { z } from "zod";

export const personalMarkRouter = t.router({
    getByUser: protectedProcedure
        .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
        .query(async ({ input, ctx }) =>
            ctx.personalMarkService.getPersonalMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
        ),
    addToUser: protectedProcedure
        .input(z.object({ userId: z.string().uuid(), markId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) =>
            ctx.personalMarkService.addPersonalMarkToUserId(input.userId, input.markId)
        ),
    removeFromUser: protectedProcedure
        .input(z.object({ userId: z.string().uuid(), markId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) =>
            ctx.personalMarkService.removePersonalMarkFromUserId(input.userId, input.markId)
        ),
    getExpiryDateForUser: protectedProcedure
        .input(z.string().uuid())
        .query(async ({ input, ctx }) => ctx.personalMarkService.getExpiryDateForUserId(input)),
});
