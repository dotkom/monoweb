import type { AttendeeId, FeedbackFormAnswer, FeedbackFormAnswerWrite, FeedbackFormId } from "@dotkomonline/types"
import type { FeedbackFormAnswerRepository } from "./feedback-form-answer-repository"

export interface FeedbackFormAnswerService {
  create(data: FeedbackFormAnswerWrite): Promise<FeedbackFormAnswer>
  getAllAnswers(formId: FeedbackFormId): Promise<FeedbackFormAnswer[]>
  findAnswerByAttendee(formId: FeedbackFormId, attendeeId: AttendeeId): Promise<FeedbackFormAnswer | null>
}

export class FeedbackFormAnswerServiceImpl implements FeedbackFormAnswerService {
  private readonly formAnswerRepository: FeedbackFormAnswerRepository

  constructor(formAnswerRepository: FeedbackFormAnswerRepository) {
    this.formAnswerRepository = formAnswerRepository
  }

  public async create(data: FeedbackFormAnswerWrite) {
    const { questionAnswers, ...rest } = data

    const validatedQuestionAnswers = questionAnswers.filter(
      (questionAnswer) => questionAnswer.value !== null || questionAnswer.selectedOptions.length > 0
    )

    return await this.formAnswerRepository.create({
      ...rest,
      questionAnswers: validatedQuestionAnswers,
    })
  }

  public async getAllAnswers(formId: FeedbackFormId) {
    return this.formAnswerRepository.getAllAnswers(formId)
  }

  public async findAnswerByAttendee(formId: FeedbackFormId, attendeeId: AttendeeId) {
    return await this.formAnswerRepository.findAnswerByAttendee(formId, attendeeId)
  }
}
