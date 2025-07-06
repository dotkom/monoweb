import {
  AttendeeSchema,
  EventSchema,
  FeedbackFormAnswerWriteSchema,
  FeedbackFormIdSchema,
  FeedbackFormWriteSchema,
  FeedbackQuestionUpdateSchema,
  FeedbackQuestionWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const feedbackRouter = t.router({
  createForm: protectedProcedure
    .input(z.object({ form: FeedbackFormWriteSchema, questions: FeedbackQuestionWriteSchema.array() }))
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.create(input.form, input.questions)),
  updateForm: protectedProcedure
    .input(
      z.object({
        id: FeedbackFormIdSchema,
        data: FeedbackFormWriteSchema,
        questions: FeedbackQuestionUpdateSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.update(input.id, input.data, input.questions)),
  findFormByEventId: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.feedbackFormService.findByEventId(input)),
  createAnswer: protectedProcedure
    .input(FeedbackFormAnswerWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.feedbackFormAnswerService.create(input)),
  findAnswerByAttendee: protectedProcedure
    .input(
      z.object({
        formId: FeedbackFormIdSchema,
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.feedbackFormAnswerService.findAnswerByAttendee(input.formId, input.attendeeId)
    ),
  getAllAnswers: protectedProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) => ctx.feedbackFormAnswerService.getAllAnswers(input)),
})
