import type { DBHandle } from "@dotkomonline/db"
import type {
  EventId,
  FeedbackForm,
  FeedbackFormId,
  FeedbackFormWrite,
  FeedbackPublicResultsToken,
  FeedbackQuestionWrite,
} from "@dotkomonline/types"
import { FeedbackFormNotFoundError } from "./feedback-form-errors"
import type { FeedbackFormRepository } from "./feedback-form-repository"

export interface FeedbackFormService {
  create(handle: DBHandle, feedbackForm: FeedbackFormWrite, questions: FeedbackQuestionWrite[]): Promise<FeedbackForm>
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
  getByPublicResultsToken(handle: DBHandle, publicResultsToken: FeedbackPublicResultsToken): Promise<FeedbackForm>
  getPublicResultsToken(handle: DBHandle, id: FeedbackFormId): Promise<FeedbackPublicResultsToken>
}

export function getFeedbackFormService(formRepository: FeedbackFormRepository): FeedbackFormService {
  return {
    async create(handle, feedbackForm, questions) {
      return await formRepository.create(handle, feedbackForm, questions)
    },
    async update(handle, id, feedbackForm, questions) {
      return await formRepository.update(handle, id, feedbackForm, questions)
    },
    async delete(handle, id) {
      await formRepository.delete(handle, id)
    },
    async getById(handle, id) {
      const feedbackForm = await formRepository.getById(handle, id)
      if (!feedbackForm) {
        throw new FeedbackFormNotFoundError()
      }

      return feedbackForm
    },
    async findByEventId(handle, eventId) {
      return await formRepository.getByEventId(handle, eventId)
    },
    async getByEventId(handle, eventId) {
      const feedbackForm = await formRepository.getByEventId(handle, eventId)
      if (!feedbackForm) {
        throw new FeedbackFormNotFoundError()
      }

      return feedbackForm
    },
    async getByPublicResultsToken(handle, publicResultsToken) {
      const feedbackForm = await formRepository.getByPublicResultsToken(handle, publicResultsToken)
      if (!feedbackForm) {
        throw new FeedbackFormNotFoundError()
      }

      const { questions, ...form } = feedbackForm
      const filteredQuestions = questions.filter((question) => question.showInPublicResults)

      return {
        ...form,
        questions: filteredQuestions,
      }
    },
    async getPublicResultsToken(handle, id) {
      const token = await formRepository.getPublicResultsToken(handle, id)
      if (!token) {
        throw new FeedbackFormNotFoundError()
      }

      return token
    },
  }
}
