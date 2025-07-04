import type {
  FeedbackFormId,
  FeedbackQuestion,
  FeedbackQuestionId,
  FeedbackQuestionOption,
  FeedbackQuestionOptionUpdate,
  FeedbackQuestionUpdate,
  FeedbackQuestionWrite,
} from "@dotkomonline/types"
import type { FeedbackQuestionOptionRepository } from "./feedback-question-option-repository"
import type { FeedbackQuestionRepository } from "./feedback-question-repository"

export interface FeedbackQuestionService {
  setOptions(id: FeedbackQuestionId, options: FeedbackQuestionOption[]): Promise<FeedbackQuestionOption[]>
  create(feedbackFormId: FeedbackFormId, data: FeedbackQuestionWrite): Promise<FeedbackQuestion>
  delete(id: FeedbackQuestionId): Promise<void>
  update(id: FeedbackQuestionId, data: FeedbackQuestionUpdate): Promise<FeedbackQuestion>
  getAllByFormId(id: FeedbackFormId): Promise<FeedbackQuestion[]>
}

export class FeedbackQuestionServiceImpl implements FeedbackQuestionService {
  private readonly questionRepository: FeedbackQuestionRepository
  private readonly optionRepository: FeedbackQuestionOptionRepository

  constructor(
    feedbackQuestionRepository: FeedbackQuestionRepository,
    feedbackQuestionOptionRepository: FeedbackQuestionOptionRepository
  ) {
    this.questionRepository = feedbackQuestionRepository
    this.optionRepository = feedbackQuestionOptionRepository
  }

  public async create(feedbackFormId: FeedbackFormId, data: FeedbackQuestionWrite): Promise<FeedbackQuestion> {
    const createdQuestion = await this.questionRepository.create(feedbackFormId, data)

    const createdOptions = await this.setOptions(createdQuestion.id, data.options)
    createdQuestion.options = createdOptions

    return createdQuestion
  }

  public async delete(id: FeedbackQuestionId): Promise<void> {
    await this.questionRepository.delete(id)
  }

  //TODO: Make sure any getBy i make in repos return | null, in service throws if null
  public async update(id: FeedbackQuestionId, data: FeedbackQuestionUpdate): Promise<FeedbackQuestion> {
    const updatedQuestion = await this.questionRepository.update(id, data)

    const updatedOptions = await this.setOptions(id, data.options)
    updatedQuestion.options = updatedOptions

    return updatedQuestion
  }

  public async getAllByFormId(id: FeedbackFormId): Promise<FeedbackQuestion[]> {
    return await this.questionRepository.getAllByFormId(id)
  }

  public async setOptions(
    id: FeedbackQuestionId,
    options: FeedbackQuestionOptionUpdate[]
  ): Promise<FeedbackQuestionOption[]> {
    const optionIds = options.map((option) => option.id)

    const currentOptions = await this.optionRepository.getAllByQuestionId(id)
    const currentOptionIds = currentOptions.map((option) => option.id)

    const optionsToAdd = options.filter((option) => !option.id || !currentOptionIds.includes(option.id))
    const optionsToRemove = currentOptions.filter((currentOption) => !optionIds.includes(currentOption.id))

    const removePromises = optionsToRemove.map(async (option) => this.optionRepository.delete(option.id))
    const addPromises = optionsToAdd.map(async (option) => this.optionRepository.create(id, option))

    const addedOptions = await Promise.all([...addPromises])
    await Promise.all([...removePromises])

    return currentOptions.filter((option) => !optionsToRemove.includes(option)).concat(addedOptions)
  }
}
