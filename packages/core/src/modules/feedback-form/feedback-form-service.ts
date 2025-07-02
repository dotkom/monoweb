import type { EventId, FeedbackForm, FeedbackFormId, FeedbackFormWrite } from "@dotkomonline/types"
import type { FeedbackFormRepository } from "./feedback-form-repository"

export interface FeedbackFormService {
  create(data: FeedbackFormWrite): Promise<FeedbackForm>
  update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  getByEventId(eventId: EventId): Promise<FeedbackForm | null>
}

export class FeedbackFormServiceImpl implements FeedbackFormService {
  private readonly feedbackFormRepository: FeedbackFormRepository

  constructor(feedbackFormRepository: FeedbackFormRepository) {
    this.feedbackFormRepository = feedbackFormRepository
  }

  public async create(data: FeedbackFormWrite) {
    return await this.feedbackFormRepository.create(data)
  }

  public async update(id: FeedbackFormId, data: FeedbackFormWrite) {
    return await this.feedbackFormRepository.update(id, data)
  }

  public async getByEventId(eventId: EventId): Promise<FeedbackForm | null> {
    return await this.feedbackFormRepository.getByEventId(eventId)
  }
}
