import type { EventId, FeedbackForm, FeedbackFormId, FeedbackFormWrite } from "@dotkomonline/types"
import { FeedbackFormNotFoundError } from "./feedback-form-errors"
import type { FeedbackFormRepository } from "./feedback-form-repository"

export interface FeedbackFormService {
  create(data: FeedbackFormWrite): Promise<FeedbackForm>
  update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  findByEventId(eventId: EventId): Promise<FeedbackForm | null>
  getById(id: FeedbackFormId): Promise<FeedbackForm>
  delete(id: FeedbackFormId): Promise<void>
}

export class FeedbackFormServiceImpl implements FeedbackFormService {
  private readonly formRepository: FeedbackFormRepository

  constructor(feedbackFormRepository: FeedbackFormRepository) {
    this.formRepository = feedbackFormRepository
  }

  public async create(data: FeedbackFormWrite) {
    return await this.formRepository.create(data)
  }

  public async update(id: FeedbackFormId, data: FeedbackFormWrite) {
    return await this.formRepository.update(id, data)
  }

  public async delete(id: FeedbackFormId) {
    await this.formRepository.delete(id)
  }

  public async getById(id: FeedbackFormId) {
    const feedbackForm = await this.formRepository.getById(id)
    if (!feedbackForm) {
      throw new FeedbackFormNotFoundError(id)
    }

    return feedbackForm
  }

  public async findByEventId(eventId: EventId) {
    return await this.formRepository.getByEventId(eventId)
  }
}
