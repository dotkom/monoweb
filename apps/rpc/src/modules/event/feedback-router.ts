import {
  AttendeeSchema,
  EventSchema,
  FeedbackFormAnswerWriteSchema,
  FeedbackFormIdSchema,
  FeedbackFormWriteSchema,
  FeedbackPublicResultsTokenSchema,
  FeedbackQuestionAnswerSchema,
  FeedbackQuestionAnswerWriteSchema,
  FeedbackQuestionWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, publicProcedure, t } from "../../trpc"

export const feedbackRouter = t.router({
  createForm: adminProcedure
    .input(
      z.object({
        feedbackForm: FeedbackFormWriteSchema,
        questions: FeedbackQuestionWriteSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.feedbackFormService.create(handle, input.feedbackForm, input.questions)
      )
    ),
  updateForm: adminProcedure
    .input(
      z.object({
        id: FeedbackFormIdSchema,
        feedbackForm: FeedbackFormWriteSchema,
        questions: FeedbackQuestionWriteSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.feedbackFormService.update(handle, input.id, input.feedbackForm, input.questions)
      )
    ),
  deleteForm: adminProcedure
    .input(FeedbackFormIdSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.delete(handle, input))
    ),
  getFormById: protectedProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getById(handle, input))
    ),
  findFormByEventId: protectedProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.findByEventId(handle, input))
    ),
  getFormByEventid: protectedProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getByEventId(handle, input))
    ),
  getFormByPublicResultsToken: publicProcedure
    .input(FeedbackPublicResultsTokenSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getByPublicResultsToken(handle, input))
    ),
  getPublicResultsToken: adminProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getPublicResultsToken(handle, input))
    ),
  createAnswer: protectedProcedure
    .input(
      z.object({
        formAnswer: FeedbackFormAnswerWriteSchema,
        questionAnswers: FeedbackQuestionAnswerWriteSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.feedbackFormAnswerService.create(handle, input.formAnswer, input.questionAnswers)
      )
    ),
  findAnswerByAttendee: adminProcedure
    .input(
      z.object({
        formId: FeedbackFormIdSchema,
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.feedbackFormAnswerService.findAnswerByAttendee(handle, input.formId, input.attendeeId)
      )
    ),
  getAllAnswers: adminProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.getAllAnswers(handle, input))
    ),
  getAnswersByPublicResultsToken: publicProcedure
    .input(FeedbackPublicResultsTokenSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.feedbackFormAnswerService.getAnswersByPublicResultsToken(handle, input)
      )
    ),
  deleteQuestionAnswer: adminProcedure
    .input(FeedbackQuestionAnswerSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.deleteQuestionAnswer(handle, input))
    ),
})
