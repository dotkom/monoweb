import type {
  EventId,
  FeedbackForm,
  FeedbackFormId,
  FeedbackFormWrite,
  FeedbackQuestion,
  FeedbackQuestionUpdate,
  FeedbackQuestionWrite,
} from "@dotkomonline/types"
import type { FeedbackFormRepository } from "./feedback-form-repository"
import type { FeedbackQuestionService } from "./feedback-question-service"

export interface FeedbackFormService {
  create(data: FeedbackFormWrite, questions: FeedbackQuestionWrite[]): Promise<FeedbackForm>
  update(id: FeedbackFormId, data: FeedbackFormWrite, questions: FeedbackQuestionUpdate[]): Promise<FeedbackForm>
  findByEventId(eventId: EventId): Promise<FeedbackForm | null>
}

export class FeedbackFormServiceImpl implements FeedbackFormService {
  private readonly formRepository: FeedbackFormRepository
  private readonly questionService: FeedbackQuestionService

  constructor(feedbackFormRepository: FeedbackFormRepository, feedbackQuestionService: FeedbackQuestionService) {
    this.formRepository = feedbackFormRepository
    this.questionService = feedbackQuestionService
  }

  public async create(data: FeedbackFormWrite, questions: FeedbackQuestionWrite[]): Promise<FeedbackForm> {
    const createdForm = await this.formRepository.create(data)

    const addPromises = questions.map((question) => this.questionService.create(createdForm.id, question))
    const createdQuestions = await Promise.all([...addPromises])

    createdForm.questions = createdQuestions
    return createdForm
  }

  public async update(id: FeedbackFormId, data: FeedbackFormWrite, questions: FeedbackQuestionUpdate[]) {
    const updatedForm = await this.formRepository.update(id, data)

    const updatedQuestions = await this.setQuestions(id, questions)
    updatedForm.questions = updatedQuestions

    return updatedForm
  }

  public async findByEventId(eventId: EventId): Promise<FeedbackForm | null> {
    return await this.formRepository.findByEventId(eventId)
  }

  public async setQuestions(id: FeedbackFormId, questions: FeedbackQuestionUpdate[]): Promise<FeedbackQuestion[]> {
    const questionIds = questions.map((question) => question.id)

    const currentQuestions = await this.questionService.getAllByFormId(id)
    const currentQuestionIds = currentQuestions.map((question) => question.id)

    const questionsToAdd = questions.filter((question) => !question.id || !currentQuestionIds.includes(question.id))
    const questionsToRemove = currentQuestions.filter((currentQuestion) => !questionIds.includes(currentQuestion.id))
    const questionsToUpdate = questions.filter((question) => question.id && currentQuestionIds.includes(question.id))

    const addPromises = questionsToAdd.map(async (question) => this.questionService.create(id, question))
    const removePromises = questionsToRemove.map(async (question) => this.questionService.delete(question.id))
    const updatePromises = questionsToUpdate
      .filter((q): q is FeedbackQuestionUpdate & { id: string } => !!q.id)
      .map(async (question) => this.questionService.update(question.id, question))

    await Promise.all(removePromises)

    const addedQuestions = await Promise.all(addPromises)
    const updatedQuestions = await Promise.all(updatePromises)

    return [...addedQuestions, ...updatedQuestions]
  }
}
