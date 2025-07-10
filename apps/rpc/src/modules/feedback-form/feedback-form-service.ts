import type { DBHandle } from "@dotkomonline/db"
import type {
  EventId,
  FeedbackForm,
  FeedbackFormId,
  FeedbackFormWrite,
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
        throw new FeedbackFormNotFoundError(id)
      }

      return feedbackForm
    },
    async findByEventId(handle, eventId) {
      return await formRepository.getByEventId(handle, eventId)
    },
  }
}
