import {
  EventSchema,
  FeedbackFormIdSchema,
  FeedbackFormWriteSchema,
  FeedbackQuestionUpdateSchema,
  FeedbackQuestionWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const feedbackFormRouter = t.router({
  create: protectedProcedure
    .input(z.object({ form: FeedbackFormWriteSchema, questions: FeedbackQuestionWriteSchema.array() }))
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.create(input.form, input.questions)),
  update: protectedProcedure
    .input(
      z.object({
        id: FeedbackFormIdSchema,
        data: FeedbackFormWriteSchema,
        questions: FeedbackQuestionUpdateSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.update(input.id, input.data, input.questions)),
  getByEventId: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.feedbackFormService.getByEventId(input)),
})
