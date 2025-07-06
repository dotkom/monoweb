import type { DBClient } from "@dotkomonline/db"
import {
  type EventId,
  type FeedbackForm,
  type FeedbackFormId,
  type FeedbackFormWrite,
  FeedbackQuestionSchema,
} from "@dotkomonline/types"
import { z } from "zod"

export interface FeedbackFormRepository {
  create(data: FeedbackFormWrite): Promise<FeedbackForm>
  update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  findByEventId(eventId: EventId): Promise<FeedbackForm | null>
}

export class FeedbackFormRepositoryImpl implements FeedbackFormRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  private includeQuestions = {
    questions: { include: { options: true } },
  }

  public async create(data: FeedbackFormWrite) {
    const feedbackForm = await this.db.feedbackForm.create({ data, include: this.includeQuestions })
    return this.mapFeedbackForm(feedbackForm)
  }

  public async update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm> {
    const feedbackForm = await this.db.feedbackForm.update({
      where: { id: id },
      data: data,
      include: this.includeQuestions,
    })
    return feedbackForm
  }

  //TODO: Add getbyId and delete

  public async findByEventId(eventId: EventId) {
    const feedbackForm = await this.db.feedbackForm.findFirst({
      where: {
        eventId: eventId,
      },
      include: this.includeQuestions,
    })

    return feedbackForm
  }

  private mapFeedbackForm({ questions, ...feedbackForm }: FeedbackForm): FeedbackForm {
    return {
      ...feedbackForm,
      questions: z.array(FeedbackQuestionSchema).parse(questions),
    }
  }
}
