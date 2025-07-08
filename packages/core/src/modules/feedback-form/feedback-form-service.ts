import type { DBHandle } from "@dotkomonline/db"
import type { EventId, FeedbackForm, FeedbackFormId, FeedbackFormWrite } from "@dotkomonline/types"
import { FeedbackFormNotFoundError } from "./feedback-form-errors"
import type { FeedbackFormRepository } from "./feedback-form-repository"

export interface FeedbackFormService {
  create(handle: DBHandle, data: FeedbackFormWrite): Promise<FeedbackForm>
  update(handle: DBHandle, id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  delete(handle: DBHandle, id: FeedbackFormId): Promise<void>
  getById(handle: DBHandle, id: FeedbackFormId): Promise<FeedbackForm>
  findByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm | null>
}

export function getFeedbackFormService(formRepository: FeedbackFormRepository): FeedbackFormService {
  return {
    async create(handle, data) {
      return await formRepository.create(handle, data)
    },
    async update(handle, id, data) {
      return await formRepository.update(handle, id, data)
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
