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
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const feedbackRouter = t.router({
  createForm: authenticatedProcedure
    .input(
      z.object({
        feedbackForm: FeedbackFormWriteSchema,
        questions: FeedbackQuestionWriteSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation()
      return ctx.executeTransaction(async (handle) =>
        ctx.feedbackFormService.create(handle, input.feedbackForm, input.questions)
      )
    }),

  updateForm: procedure
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
  deleteForm: procedure
    .input(FeedbackFormIdSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.delete(handle, input))
    ),
  getFormById: procedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getById(handle, input))
    ),
  findFormByEventId: procedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.findByEventId(handle, input))
    ),
  getFormByEventid: procedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getByEventId(handle, input))
    ),
  getPublicForm: procedure
    .input(FeedbackPublicResultsTokenSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getPublicForm(handle, input))
    ),
  getPublicResultsToken: procedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getPublicResultsToken(handle, input))
    ),
  createAnswer: procedure
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
  findAnswerByAttendee: procedure
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
  getAllAnswers: procedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.getAllAnswers(handle, input))
    ),
  getPublicAnswers: procedure
    .input(FeedbackPublicResultsTokenSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.getPublicAnswers(handle, input))
    ),
  deleteQuestionAnswer: procedure
    .input(FeedbackQuestionAnswerSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.deleteQuestionAnswer(handle, input))
    ),
})
