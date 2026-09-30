import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isCommitteeMember, isSameSubject } from "../../authorization"
import { FailedPreconditionError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { AttendeeSchema } from "../event/attendance"
import { EventSchema } from "../event/event"
import {
  FeedbackFormAnswerWriteSchema,
  FeedbackFormIdSchema,
  FeedbackFormWriteSchema,
  FeedbackPublicResultsTokenSchema,
  FeedbackQuestionAnswerSchema,
  FeedbackQuestionAnswerWriteSchema,
  FeedbackQuestionsWriteSchema,
} from "./feedback-form"

export type GetFeedbackEligibilityInput = inferProcedureInput<typeof getFeedbackEligibilityProcedure>
export type GetFeedbackEligibilityOutput = inferProcedureOutput<typeof getFeedbackEligibilityProcedure>
const getFeedbackEligibilityProcedure = procedure
  .input(FeedbackFormIdSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.feedbackFormService.getFeedbackEligibility(ctx.handle, input, ctx.principal.subject)
  })

export type GetFeedbackFormStaffPreviewInput = inferProcedureInput<typeof getFeedbackFormStaffPreviewProcedure>
export type GetFeedbackFormStaffPreviewOutput = inferProcedureOutput<typeof getFeedbackFormStaffPreviewProcedure>
const getFeedbackFormStaffPreviewProcedure = procedure
  .input(FeedbackFormIdSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const feedbackForm = await ctx.feedbackFormService.getById(ctx.handle, input)
    const event = await ctx.eventService.getEventById(ctx.handle, feedbackForm.eventId)
    return {
      event,
      feedbackForm,
    }
  })

export type CreateFormInput = inferProcedureInput<typeof createFormProcedure>
export type CreateFormOutput = inferProcedureOutput<typeof createFormProcedure>
const createFormProcedure = procedure
  .input(
    z.object({
      feedbackForm: FeedbackFormWriteSchema,
      questions: FeedbackQuestionsWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdFeedbackForm = await ctx.feedbackFormService.create(ctx.handle, input.feedbackForm, input.questions)
    const event = await ctx.eventService.getEventById(ctx.handle, createdFeedbackForm.eventId)

    ctx.setAuditTransactionName(
      `Create FeedbackForm(ID=${createdFeedbackForm.id}) for Event(ID=${event.id},Title=${event.title})`
    )

    return createdFeedbackForm
  })

export type CreateFormCopyInput = inferProcedureInput<typeof createFormCopyProcedure>
export type CreateFormCopyOutput = inferProcedureOutput<typeof createFormCopyProcedure>
const createFormCopyProcedure = procedure
  .input(
    z.object({
      eventId: EventSchema.shape.id,
      eventIdToCopyFrom: EventSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdFeedbackForm = await ctx.feedbackFormService.createCopyFromEvent(
      ctx.handle,
      input.eventId,
      input.eventIdToCopyFrom
    )
    const event = await ctx.eventService.getEventById(ctx.handle, input.eventId)
    const eventToCopyFrom = await ctx.eventService.getEventById(ctx.handle, input.eventIdToCopyFrom)

    ctx.setAuditTransactionName(
      `Create FeedbackForm(ID=${createdFeedbackForm.id}) for Event(ID=${event.id},Title=${event.title}) from copy of Event(ID=${eventToCopyFrom.id},Title=${eventToCopyFrom.title})`
    )

    return createdFeedbackForm
  })

export type UpdateFormInput = inferProcedureInput<typeof updateFormProcedure>
export type UpdateFormOutput = inferProcedureOutput<typeof updateFormProcedure>
const updateFormProcedure = procedure
  .input(
    z.object({
      id: FeedbackFormIdSchema,
      feedbackForm: FeedbackFormWriteSchema,
      questions: FeedbackQuestionsWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const updatedFeedbackForm = await ctx.feedbackFormService.update(
      ctx.handle,
      input.id,
      input.feedbackForm,
      input.questions
    )
    const event = await ctx.eventService.getEventById(ctx.handle, updatedFeedbackForm.eventId)

    ctx.setAuditTransactionName(
      `Update FeedbackForm(ID=${updatedFeedbackForm.id}) for Event(ID=${event.id},Title=${event.title})`
    )

    return updatedFeedbackForm
  })

export type DeleteFormInput = inferProcedureInput<typeof deleteFormProcedure>
export type DeleteFormOutput = inferProcedureOutput<typeof deleteFormProcedure>
const deleteFormProcedure = procedure
  .input(FeedbackFormIdSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const feedbackForm = await ctx.feedbackFormService.getById(ctx.handle, input)
    const event = await ctx.eventService.getEventById(ctx.handle, feedbackForm.eventId)
    await ctx.feedbackFormService.delete(ctx.handle, input)

    ctx.setAuditTransactionName(
      `Delete FeedbackForm(ID=${feedbackForm.id}) for Event(ID=${event.id},Title=${event.title})`
    )
  })

export type GetFormByIdInput = inferProcedureInput<typeof getFormByIdProcedure>
export type GetFormByIdOutput = inferProcedureOutput<typeof getFormByIdProcedure>
const getFormByIdProcedure = procedure
  .input(FeedbackFormIdSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.feedbackFormService.getById(ctx.handle, input))

export type FindFormByEventIdInput = inferProcedureInput<typeof findFormByEventIdProcedure>
export type FindFormByEventIdOutput = inferProcedureOutput<typeof findFormByEventIdProcedure>
const findFormByEventIdProcedure = procedure
  .input(EventSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.feedbackFormService.findByEventId(ctx.handle, input))

export type GetFormByEventIdInput = inferProcedureInput<typeof getFormByEventIdProcedure>
export type GetFormByEventIdOutput = inferProcedureOutput<typeof getFormByEventIdProcedure>
const getFormByEventIdProcedure = procedure
  .input(EventSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.feedbackFormService.getByEventId(ctx.handle, input))

export type GetPublicFormInput = inferProcedureInput<typeof getPublicFormProcedure>
export type GetPublicFormOutput = inferProcedureOutput<typeof getPublicFormProcedure>
const getPublicFormProcedure = procedure
  .input(FeedbackPublicResultsTokenSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.feedbackFormService.getPublicForm(ctx.handle, input))

export type GetPublicResultsTokenInput = inferProcedureInput<typeof getPublicResultsTokenProcedure>
export type GetPublicResultsTokenOutput = inferProcedureOutput<typeof getPublicResultsTokenProcedure>
const getPublicResultsTokenProcedure = procedure
  .input(FeedbackFormIdSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.feedbackFormService.getPublicResultsToken(ctx.handle, input))

export type CreateAnswerInput = inferProcedureInput<typeof createAnswerProcedure>
export type CreateAnswerOutput = inferProcedureOutput<typeof createAnswerProcedure>
const createAnswerProcedure = procedure
  .input(
    z.object({
      formAnswer: FeedbackFormAnswerWriteSchema,
      questionAnswers: FeedbackQuestionAnswerWriteSchema.array(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.formAnswer.attendeeId)
    // Allow users to create answers if they are the attendee.
    await ctx.addAuthorizationGuard(
      isSameSubject(() => attendee.userId),
      input
    )

    const answerEligibility = await ctx.feedbackFormService.getFeedbackEligibility(
      ctx.handle,
      input.formAnswer.feedbackFormId,
      ctx.principal.subject
    )
    if (!answerEligibility.success) {
      throw new FailedPreconditionError(`Failed to submit feedback: ${answerEligibility.cause}`)
    }

    const createdAnswer = await ctx.feedbackFormAnswerService.create(
      ctx.handle,
      input.formAnswer,
      input.questionAnswers
    )
    const feedbackForm = await ctx.feedbackFormService.getById(ctx.handle, createdAnswer.feedbackFormId)
    const event = await ctx.eventService.getEventById(ctx.handle, feedbackForm.eventId)

    ctx.setAuditTransactionName(
      `Create FeedbackFormAnswer(ID=${createdAnswer.id}) for Attendee(ID=${attendee.id},Name=${attendee.user.name}) for Event(ID=${event.id},Title=${event.title})`
    )

    return createdAnswer
  })

export type FindAnswerByAttendeeInput = inferProcedureInput<typeof findAnswerByAttendeeProcedure>
export type FindAnswerByAttendeeOutput = inferProcedureOutput<typeof findAnswerByAttendeeProcedure>
const findAnswerByAttendeeProcedure = procedure
  .input(
    z.object({
      formId: FeedbackFormIdSchema,
      attendeeId: AttendeeSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) =>
    ctx.feedbackFormAnswerService.findAnswerByAttendee(ctx.handle, input.formId, input.attendeeId)
  )

export type FindOwnAnswerByAttendeeInput = inferProcedureInput<typeof findOwnAnswerByAttendeeProcedure>
export type FindOwnAnswerByAttendeeOutput = inferProcedureOutput<typeof findOwnAnswerByAttendeeProcedure>
const findOwnAnswerByAttendeeProcedure = procedure
  .input(
    z.object({
      formId: FeedbackFormIdSchema,
      attendeeId: AttendeeSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const attendee = await ctx.attendanceService.getAttendeeById(ctx.handle, input.attendeeId)
    // Allow users to view answers if they are the attendee.
    await ctx.addAuthorizationGuard(
      isSameSubject(() => attendee.userId),
      input
    )

    return ctx.feedbackFormAnswerService.findAnswerByAttendee(ctx.handle, input.formId, input.attendeeId)
  })

export type GetAllAnswersInput = inferProcedureInput<typeof getAllAnswersProcedure>
export type GetAllAnswersOutput = inferProcedureOutput<typeof getAllAnswersProcedure>
const getAllAnswersProcedure = procedure
  .input(FeedbackFormIdSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.feedbackFormAnswerService.findManyByFeedbackFormId(ctx.handle, input))

export type GetPublicAnswersInput = inferProcedureInput<typeof getPublicAnswersProcedure>
export type GetPublicAnswersOutput = inferProcedureOutput<typeof getPublicAnswersProcedure>
const getPublicAnswersProcedure = procedure
  .input(FeedbackPublicResultsTokenSchema)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.feedbackFormAnswerService.findManyByPublicResultsToken(ctx.handle, input))

export type DeleteQuestionAnswerInput = inferProcedureInput<typeof deleteQuestionAnswerProcedure>
export type DeleteQuestionAnswerOutput = inferProcedureOutput<typeof deleteQuestionAnswerProcedure>
const deleteQuestionAnswerProcedure = procedure
  .input(FeedbackQuestionAnswerSchema.shape.id)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const questionAnswer = await ctx.feedbackFormAnswerService.getQuestionAnswerById(ctx.handle, input)
    const formAnswer = await ctx.feedbackFormAnswerService.getById(ctx.handle, questionAnswer.formAnswerId)

    await ctx.feedbackFormAnswerService.deleteQuestionAnswer(ctx.handle, input)
    const feedbackForm = await ctx.feedbackFormService.getById(ctx.handle, formAnswer.feedbackFormId)
    const event = await ctx.eventService.getEventById(ctx.handle, feedbackForm.eventId)

    ctx.setAuditTransactionName(
      `Delete FeedbackQuestionAnswer(ID=${questionAnswer.id}) for Event(ID=${event.id},Title=${event.title})`
    )
  })

export const feedbackRouter = t.router({
  getFeedbackEligibility: getFeedbackEligibilityProcedure,
  getFeedbackFormStaffPreview: getFeedbackFormStaffPreviewProcedure,
  createForm: createFormProcedure,
  createFormCopy: createFormCopyProcedure,
  updateForm: updateFormProcedure,
  deleteForm: deleteFormProcedure,
  getFormById: getFormByIdProcedure,
  findFormByEventId: findFormByEventIdProcedure,
  getFormByEventId: getFormByEventIdProcedure,
  getPublicForm: getPublicFormProcedure,
  getPublicResultsToken: getPublicResultsTokenProcedure,
  createAnswer: createAnswerProcedure,
  findAnswerByAttendee: findAnswerByAttendeeProcedure,
  findOwnAnswerByAttendee: findOwnAnswerByAttendeeProcedure,
  getAllAnswers: getAllAnswersProcedure,
  getPublicAnswers: getPublicAnswersProcedure,
  deleteQuestionAnswer: deleteQuestionAnswerProcedure,
})
