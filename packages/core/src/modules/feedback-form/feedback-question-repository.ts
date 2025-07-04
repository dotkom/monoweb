import type { DBClient } from "@dotkomonline/db"
import type { FeedbackFormId, FeedbackQuestion, FeedbackQuestionId, FeedbackQuestionWrite } from "@dotkomonline/types"

export interface FeedbackQuestionRepository {
  create(feedbackFormId: FeedbackFormId, data: FeedbackQuestionWrite): Promise<FeedbackQuestion>
  delete(id: FeedbackQuestionId): Promise<void>
  update(id: FeedbackQuestionId, data: FeedbackQuestionWrite): Promise<FeedbackQuestion>
  getAllByFormId(id: FeedbackFormId): Promise<FeedbackQuestion[]>
}

export class FeedbackQuestionRepositoryImpl implements FeedbackQuestionRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  public async create(feedbackFormId: FeedbackFormId, data: FeedbackQuestionWrite) {
    const {options, ...question} = data
    
    return await this.db.feedbackQuestion.create({
      data: { feedbackFormId, ...question },
      include: {
        options: true,
      },
    })
  }

  public async update(id: FeedbackQuestionId, data: FeedbackQuestionWrite): Promise<FeedbackQuestion> {
    const { options, ...question } = data
    
    return await this.db.feedbackQuestion.update({
      where: {
        id,
      },
      data: question,
      include: {
        options: true,
      },
    })
  }

  public async delete(id: FeedbackQuestionId): Promise<void> {
    await this.db.feedbackQuestion.delete({
      where: {
        id,
      },
    })
  }

  public async getAllByFormId(feedbackFormId: FeedbackFormId): Promise<FeedbackQuestion[]> {
    return await this.db.feedbackQuestion.findMany({
      where: {
        feedbackFormId,
      },
      include: {
        options: true,
      },
    })
  }
}
