import {
  AttendeeSchema,
  EventSchema,
  FeedbackFormAnswerWriteSchema,
  FeedbackFormIdSchema,
  FeedbackFormWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const feedbackRouter = t.router({
  createForm: protectedProcedure
    .input(FeedbackFormWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.create(input)),
  updateForm: protectedProcedure
    .input(
      z.object({
        id: FeedbackFormIdSchema,
        data: FeedbackFormWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.update(input.id, input.data)),
  deleteForm: protectedProcedure
    .input(FeedbackFormIdSchema)
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.delete(input)),
  getFormById: protectedProcedure
    .input(FeedbackFormIdSchema)
    .mutation(async ({ input, ctx }) => ctx.feedbackFormService.getById(input)),
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
