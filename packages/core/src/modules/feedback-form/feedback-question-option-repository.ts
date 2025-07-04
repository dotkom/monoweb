import type { DBClient } from "@dotkomonline/db"
import type {
  FeedbackQuestionId,
  FeedbackQuestionOption,
  FeedbackQuestionOptionId,
  FeedbackQuestionOptionWrite,
} from "@dotkomonline/types"

export interface FeedbackQuestionOptionRepository {
  create(questionId: FeedbackQuestionId, data: FeedbackQuestionOptionWrite): Promise<FeedbackQuestionOption>
  delete(id: FeedbackQuestionOptionId): Promise<void>
  getAllByQuestionId(id: FeedbackQuestionId): Promise<FeedbackQuestionOption[]>
}

export class FeedbackQuestionOptionRepositoryImpl implements FeedbackQuestionOptionRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }
  public async delete(id: FeedbackQuestionOptionId): Promise<void> {
    await this.db.feedbackQuestionOption.delete({
      where: {
        id: id,
      },
    })
  }

  public async create(
    questionId: FeedbackQuestionId,
    data: FeedbackQuestionOptionWrite
  ): Promise<FeedbackQuestionOption> {
    return await this.db.feedbackQuestionOption.create({
      data: {
        questionId,
        ...data,
      },
    })
  }

  public async getAllByQuestionId(id: FeedbackQuestionId): Promise<FeedbackQuestionOption[]> {
    return await this.db.feedbackQuestionOption.findMany({
      where: {
        questionId: id,
      },
    })
  }
}
