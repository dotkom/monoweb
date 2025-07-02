import type { DBClient, FeedbackForm as DBFeedbackForm } from "@dotkomonline/db"
import {
  type EventId,
  type FeedbackForm,
  type FeedbackFormId,
  FeedbackFormQuestionSchema,
  type FeedbackFormWrite,
} from "@dotkomonline/types"
import { z } from "zod"

export interface FeedbackFormRepository {
  create(data: FeedbackFormWrite): Promise<FeedbackForm>
  update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  getByEventId(eventId: EventId): Promise<FeedbackForm | null>
}

export class FeedbackFormRepositoryImpl implements FeedbackFormRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async create(data: FeedbackFormWrite) {
    const feedbackForm = await this.db.feedbackForm.create({ data })
    return this.mapFeedbackForm(feedbackForm)
  }

  public async update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm> {
    const feedbackForm = await this.db.feedbackForm.update({where: {id: id}, data: data})
    return this.mapFeedbackForm(feedbackForm)
  }

  public async getByEventId(eventId: EventId) {
    const feedbackForm = await this.db.feedbackForm.findFirst({
      where: {
        eventId: eventId,
      },
    })

    return feedbackForm && this.mapFeedbackForm(feedbackForm)
  }

  private mapFeedbackForm({ questions, ...feedbackForm }: DBFeedbackForm): FeedbackForm {
    return {
      ...feedbackForm,
      questions: z.array(FeedbackFormQuestionSchema).parse(questions),
    }
  }
}
