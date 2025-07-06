import type { EventId, FeedbackForm, FeedbackFormId, FeedbackFormWrite } from "@dotkomonline/types"
import type { FeedbackFormRepository } from "./feedback-form-repository"

export interface FeedbackFormService {
  create(data: FeedbackFormWrite): Promise<FeedbackForm>
  update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  findByEventId(eventId: EventId): Promise<FeedbackForm | null>
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

  public async findByEventId(eventId: EventId): Promise<FeedbackForm | null> {
    return await this.formRepository.findByEventId(eventId)
  }
}
