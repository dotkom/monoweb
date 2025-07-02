import { EventSchema, FeedbackFormIdSchema, FeedbackFormWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { z } from "zod"

export const feedbackFormRouter = t.router({
  create: protectedProcedure
    .input(FeedbackFormWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.create(input)),
  update: protectedProcedure
    .input(z.object({
        id: FeedbackFormIdSchema,
        data: FeedbackFormWriteSchema
    }))
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.update(input.id, input.data)),
  getByEventId: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.feedbackFormService.getByEventId(input)),
})
