import { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import type {
  EventId,
  FeedbackForm,
  FeedbackFormId,
  FeedbackFormWrite,
  FeedbackPublicResultsToken,
  FeedbackQuestionWrite,
} from "@dotkomonline/types"
import { addWeeks, isEqual } from "date-fns"
import { NotFoundError } from "../../error"
import type { EventService } from "../event/event-service"
import { tasks } from "../task/task-definition"
import type { TaskSchedulingService } from "../task/task-scheduling-service"
import type { FeedbackFormRepository } from "./feedback-form-repository"

export interface FeedbackFormService {
  create(handle: DBHandle, feedbackForm: FeedbackFormWrite, questions: FeedbackQuestionWrite[]): Promise<FeedbackForm>
  createCopyFromEvent(handle: DBHandle, eventId: EventId, eventIdToCopyFrom: EventId): Promise<FeedbackForm>
  update(
    handle: DBHandle,
    id: FeedbackFormId,
    feedbackForm: FeedbackFormWrite,
    questions: FeedbackQuestionWrite[]
  ): Promise<FeedbackForm>
  delete(handle: DBHandle, id: FeedbackFormId): Promise<void>
  getById(handle: DBHandle, id: FeedbackFormId): Promise<FeedbackForm>
  findByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm | null>
  getByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm>
  getPublicForm(handle: DBHandle, publicResultsToken: FeedbackPublicResultsToken): Promise<FeedbackForm>
  getPublicResultsToken(handle: DBHandle, id: FeedbackFormId): Promise<FeedbackPublicResultsToken>
}

export function getFeedbackFormService(
  formRepository: FeedbackFormRepository,
  taskSchedulingService: TaskSchedulingService,
  eventService: EventService
): FeedbackFormService {
  return {
    async create(handle, feedbackForm, questions) {
      const row = await formRepository.create(handle, feedbackForm, questions)

      if (row.isActive) {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.VERIFY_FEEDBACK_ANSWERED,
          { feedbackFormId: row.id },
          new TZDate(row.answerDeadline)
        )
      }

      return row
    },
    async createCopyFromEvent(handle, eventId, eventIdToCopyFrom) {
      const formToCopy = await this.getByEventId(handle, eventIdToCopyFrom)
      const event = await eventService.getEventById(handle, eventId)

      const feedbackForm: FeedbackFormWrite = {
        eventId,
        isActive: false,
        answerDeadline: addWeeks(event.end, 2),
      }
      const questions = formToCopy.questions

      const row = await formRepository.create(handle, feedbackForm, questions)

      if (row.isActive) {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.VERIFY_FEEDBACK_ANSWERED,
          { feedbackFormId: row.id },
          new TZDate(row.answerDeadline)
        )
      }

      return row
    },
    async update(handle, id, feedbackForm, questions) {
      const previousRow = await this.getById(handle, id)
      const task = await taskSchedulingService.findVerifyFeedbackAnsweredTask(handle, id)

      if (task?.status === "COMPLETED" && !isEqual(previousRow.answerDeadline, feedbackForm.answerDeadline)) {
        throw new Error("Can't change answer deadline of a feedback form that has already given out marks")
      }

      const row = await formRepository.update(handle, id, feedbackForm, questions)

      // Inactive feedback forms should not cause marks for missing answers
      const desiredAt = row.isActive ? row.answerDeadline : null

      if (task && (!desiredAt || !isEqual(task.scheduledAt, desiredAt))) {
        await taskSchedulingService.cancel(handle, task.id)
      }

      if (desiredAt && task?.status !== "COMPLETED") {
        await taskSchedulingService.scheduleAt(
          handle,
          tasks.VERIFY_FEEDBACK_ANSWERED,
          { feedbackFormId: row.id },
          new TZDate(row.answerDeadline)
        )
      }

      return row
    },
    async delete(handle, id) {
      await formRepository.delete(handle, id)

      const task = await taskSchedulingService.findVerifyFeedbackAnsweredTask(handle, id)
      if (task) taskSchedulingService.cancel(handle, task.id)
    },
    async getById(handle, id) {
      const feedbackForm = await formRepository.getById(handle, id)
      if (!feedbackForm) {
        throw new NotFoundError(`FeedbackForm(ID=${id}) not found`)
      }

      return feedbackForm
    },
    async findByEventId(handle, eventId) {
      return await formRepository.getByEventId(handle, eventId)
    },
    async getByEventId(handle, eventId) {
      const feedbackForm = await formRepository.getByEventId(handle, eventId)
      if (!feedbackForm) {
        throw new NotFoundError(`FeedbackForm(EventID=${eventId}) not found`)
      }

      return feedbackForm
    },
    async getPublicForm(handle, publicResultsToken) {
      const feedbackForm = await formRepository.getByPublicResultsToken(handle, publicResultsToken)
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
    async getPublicResultsToken(handle, id) {
      const token = await formRepository.getPublicResultsToken(handle, id)
      if (!token) {
        throw new NotFoundError(`FeedbackForm(ID=${id}) not found`)
      }

      return token
    },
  }
}
