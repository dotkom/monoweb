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
import { FailedPreconditionError } from "../../error"
import { authenticatedProcedure, procedure, staffProcedure, t } from "../../trpc"

export const feedbackRouter = t.router({
  getFeedbackEligibility: authenticatedProcedure.input(FeedbackFormIdSchema).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.feedbackFormService.getFeedbackEligibility(handle, input, ctx.principal.subject)
    })
  ),

  getFeedbackFormStaffPreview: staffProcedure.input(FeedbackFormIdSchema).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      const feedbackForm = await ctx.feedbackFormService.getById(handle, input)
      const event = await ctx.eventService.getEventById(handle, feedbackForm.eventId)
      return {
        event,
        feedbackForm,
      }
    })
  ),

  createForm: staffProcedure
    .input(
      z.object({
        feedbackForm: FeedbackFormWriteSchema,
        questions: FeedbackQuestionWriteSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
        ctx.feedbackFormService.create(handle, input.feedbackForm, input.questions)
      )
    }),

  createFormCopy: staffProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
        eventIdToCopyFrom: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeAuditedTransaction(async (handle) =>
        ctx.feedbackFormService.createCopyFromEvent(handle, input.eventId, input.eventIdToCopyFrom)
      )
    }),

  updateForm: staffProcedure
    .input(
      z.object({
        id: FeedbackFormIdSchema,
        feedbackForm: FeedbackFormWriteSchema,
        questions: FeedbackQuestionWriteSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) =>
        ctx.feedbackFormService.update(handle, input.id, input.feedbackForm, input.questions)
      )
    ),
  deleteForm: staffProcedure
    .input(FeedbackFormIdSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => ctx.feedbackFormService.delete(handle, input))
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
  getFormByEventId: procedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getByEventId(handle, input))
    ),
  getPublicForm: procedure
    .input(FeedbackPublicResultsTokenSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getPublicForm(handle, input))
    ),
  getPublicResultsToken: staffProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormService.getPublicResultsToken(handle, input))
    ),
  createAnswer: authenticatedProcedure
    .input(
      z.object({
        formAnswer: FeedbackFormAnswerWriteSchema,
        questionAnswers: FeedbackQuestionAnswerWriteSchema.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => {
        const attendee = await ctx.attendanceService.getAttendeeById(handle, input.formAnswer.attendeeId)
        ctx.authorize.requireMe(attendee.userId)

        const answerEligibility = await ctx.feedbackFormService.getFeedbackEligibility(
          handle,
          input.formAnswer.feedbackFormId,
          ctx.principal.subject
        )
        if (!answerEligibility.success) {
          throw new FailedPreconditionError(`Failed to submit feedback: ${answerEligibility.cause}`)
        }

        return ctx.feedbackFormAnswerService.create(handle, input.formAnswer, input.questionAnswers)
      })
    ),
  findAnswerByAttendee: staffProcedure
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
  findOwnAnswerByAttendee: authenticatedProcedure
    .input(
      z.object({
        formId: FeedbackFormIdSchema,
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const attendee = await ctx.attendanceService.getAttendeeById(handle, input.attendeeId)
        ctx.authorize.requireMe(attendee.userId)

        return ctx.feedbackFormAnswerService.findAnswerByAttendee(handle, input.formId, input.attendeeId)
      })
    ),
  getAllAnswers: staffProcedure
    .input(FeedbackFormIdSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.getAllAnswers(handle, input))
    ),
  getPublicAnswers: procedure
    .input(FeedbackPublicResultsTokenSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.feedbackFormAnswerService.getPublicAnswers(handle, input))
    ),
  deleteQuestionAnswer: staffProcedure
    .input(FeedbackQuestionAnswerSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => ctx.feedbackFormAnswerService.deleteQuestionAnswer(handle, input))
    ),
})
