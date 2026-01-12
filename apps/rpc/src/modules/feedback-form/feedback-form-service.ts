import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import {
  type Attendee,
  type Event,
  type EventId,
  type FeedbackForm,
  type FeedbackFormId,
  type FeedbackFormWrite,
  type FeedbackPublicResultsToken,
  type FeedbackQuestionWrite,
  type FeedbackRejectionCause,
  type UserId,
  getDefaultFeedbackAnswerDeadline,
} from "@dotkomonline/types"
import { isEqual, isFuture, isPast } from "date-fns"
import { NotFoundError } from "../../error"
import type { AttendanceRepository } from "../event/attendance-repository"
import type { EventService } from "../event/event-service"
import { tasks } from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { FeedbackFormAnswerRepository } from "./feedback-form-answer-repository"
import type { FeedbackFormRepository } from "./feedback-form-repository"

export type FeedbackEligibilityResult = FeedbackEligibilitySuccess | FeedbackEligibilityFailure

export type FeedbackEligibilitySuccess = {
  event: Event
  feedbackForm: FeedbackForm
  attendee: Attendee
  success: true
}
export type FeedbackEligibilityFailure = { cause: FeedbackRejectionCause; success: false }

export interface FeedbackFormService {
  create(
    handle: DBHandle,
    feedbackFormData: FeedbackFormWrite,
    questionsData: FeedbackQuestionWrite[]
  ): Promise<FeedbackForm>
  createCopyFromEvent(handle: DBHandle, eventId: EventId, eventIdToCopyFrom: EventId): Promise<FeedbackForm>
  update(
    handle: DBHandle,
    feedBackFormId: FeedbackFormId,
    feedbackFormData: FeedbackFormWrite,
    questionsData: FeedbackQuestionWrite[]
  ): Promise<FeedbackForm>
  delete(handle: DBHandle, feedBackFormId: FeedbackFormId): Promise<void>
  getById(handle: DBHandle, feedBackFormId: FeedbackFormId): Promise<FeedbackForm>
  findByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm | null>
  getByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm>
  getPublicForm(handle: DBHandle, publicResultsToken: FeedbackPublicResultsToken): Promise<FeedbackForm>
  getPublicResultsToken(handle: DBHandle, feedBackFormId: FeedbackFormId): Promise<FeedbackPublicResultsToken>
  getFeedbackEligibility(
    handle: DBHandle,
    feedbackFormId: FeedbackFormId,
    userId: UserId
  ): Promise<FeedbackEligibilityResult>
}

export function getFeedbackFormService(
  formRepository: FeedbackFormRepository,
  formAnswerRepository: FeedbackFormAnswerRepository,
  taskSchedulingService: TaskSchedulingService,
  eventService: EventService,
  attendanceRepository: AttendanceRepository
): FeedbackFormService {
  return {
    async create(handle, feedbackFormData, questionsData) {
      const row = await formRepository.create(handle, feedbackFormData, questionsData)

      await taskSchedulingService.scheduleAt(
        handle,
        tasks.VERIFY_FEEDBACK_ANSWERED,
        { feedbackFormId: row.id },
        new TZDate(row.answerDeadline)
      )

      return row
    },

    async createCopyFromEvent(handle, eventId, eventIdToCopyFrom) {
      const formToCopy = await this.getByEventId(handle, eventIdToCopyFrom)
      const event = await eventService.getEventById(handle, eventId)

      const feedbackForm: FeedbackFormWrite = {
        eventId,
        answerDeadline: getDefaultFeedbackAnswerDeadline(event.end),
      }
      const questions = formToCopy.questions

      return await this.create(handle, feedbackForm, questions)
    },

    async update(handle, feedbackFormId, feedbackFormData, questionsData) {
      const previousRow = await this.getById(handle, feedbackFormId)
      const task = await taskSchedulingService.findVerifyFeedbackAnsweredTask(handle, feedbackFormId)

      if (task?.status === "COMPLETED" && !isEqual(previousRow.answerDeadline, feedbackFormData.answerDeadline)) {
        throw new Error("Can't change answer deadline of a feedback form that has already given out marks")
      }

      const row = await formRepository.update(handle, feedbackFormId, feedbackFormData, questionsData)

      if (task?.status === "COMPLETED") {
        return row
      }

      let cancelled = false
      if (task && !isEqual(task.scheduledAt, row.answerDeadline)) {
        await taskSchedulingService.cancel(handle, task.id)
        cancelled = true
      }

      if (!task || cancelled) {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.VERIFY_FEEDBACK_ANSWERED,
          { feedbackFormId: row.id },
          new TZDate(row.answerDeadline)
        )
      }

      return row
    },

    async delete(handle, feedbackFormId) {
      await formRepository.delete(handle, feedbackFormId)

      const task = await taskSchedulingService.findVerifyFeedbackAnsweredTask(handle, feedbackFormId)
      if (task) {
        await taskSchedulingService.cancel(handle, task.id)
      }
    },

    async getById(handle, feedbackFormId) {
      const feedbackForm = await formRepository.findById(handle, feedbackFormId)

      if (!feedbackForm) {
        throw new NotFoundError(`FeedbackForm(ID=${feedbackFormId}) not found`)
      }

      return feedbackForm
    },

    async findByEventId(handle, eventId) {
      return await formRepository.findByEventId(handle, eventId)
    },

    async getByEventId(handle, eventId) {
      const feedbackForm = await this.findByEventId(handle, eventId)

      if (!feedbackForm) {
        throw new NotFoundError(`FeedbackForm(EventID=${eventId}) not found`)
      }

      return feedbackForm
    },

    async getPublicForm(handle, publicResultsToken) {
      const feedbackForm = await formRepository.findByPublicResultsToken(handle, publicResultsToken)

      if (!feedbackForm) {
        throw new NotFoundError(`FeedbackForm(PublicResultsToken=${publicResultsToken}) not found`)
      }

      const { questions, ...form } = feedbackForm
      const publicQuestions = questions.filter((question) => question.showInPublicResults)

      return {
        ...form,
        questions: publicQuestions,
      }
    },

    async getPublicResultsToken(handle, feedbackFormId) {
      const token = await formRepository.findPublicResultsToken(handle, feedbackFormId)

      if (!token) {
        throw new NotFoundError(`FeedbackForm(ID=${feedbackFormId}) not found`)
      }

      return token
    },

    async getFeedbackEligibility(handle, feedbackFormId, userId) {
      const feedbackForm = await formRepository.findById(handle, feedbackFormId)

      if (!feedbackForm) {
        return { cause: "NO_FEEDBACK_FORM", success: false }
      }

      const event = await eventService.findEventById(handle, feedbackForm.eventId)

      if (!event?.attendanceId) {
        return { cause: "NO_FEEDBACK_FORM", success: false }
      }

      if (!isPast(event.end)) {
        return { cause: "TOO_EARLY", success: false }
      }

      if (!isFuture(feedbackForm.answerDeadline)) {
        return { cause: "TOO_LATE", success: false }
      }

      const attendance = await attendanceRepository.findAttendanceById(handle, event.attendanceId)

      const attendee = attendance?.attendees.find((attendee) => attendee.userId === userId)

      if (!attendee || !attendee.attendedAt) {
        return { cause: "DID_NOT_ATTEND", success: false }
      }

      const previousAnswer = await formAnswerRepository.findAnswerByAttendee(handle, feedbackForm.id, attendee.id)

      if (previousAnswer) {
        return { cause: "ALREADY_ANSWERED", success: false }
      }

      return { success: true, event, feedbackForm, attendee }
    },
  }
}
