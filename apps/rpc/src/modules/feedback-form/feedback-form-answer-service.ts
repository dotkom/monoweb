import type { DBHandle } from "@dotkomonline/db"
import type {
  AttendeeId,
  FeedbackFormAnswer,
  FeedbackFormAnswerWrite,
  FeedbackFormId,
  FeedbackQuestionAnswerWrite,
} from "@dotkomonline/types"
import type { FeedbackFormAnswerRepository } from "./feedback-form-answer-repository"

export interface FeedbackFormAnswerService {
  create(
    handle: DBHandle,
    formAnswer: FeedbackFormAnswerWrite,
    questionAnswers: FeedbackQuestionAnswerWrite[]
  ): Promise<FeedbackFormAnswer>
  getAllAnswers(handle: DBHandle, formId: FeedbackFormId): Promise<FeedbackFormAnswer[]>
  findAnswerByAttendee(
    handle: DBHandle,
    formId: FeedbackFormId,
    attendeeId: AttendeeId
  ): Promise<FeedbackFormAnswer | null>
}

export function getFeedbackFormAnswerService(
  formAnswerRepository: FeedbackFormAnswerRepository
): FeedbackFormAnswerService {
  return {
    async create(handle, formAnswer, questionAnswers) {
      const validatedQuestionAnswers = questionAnswers.filter(
        (questionAnswer) => questionAnswer.value !== null || questionAnswer.selectedOptions.length > 0
      )

      return await formAnswerRepository.create(handle, formAnswer, validatedQuestionAnswers)
    },
    async getAllAnswers(handle, formId) {
      return formAnswerRepository.getAllAnswers(handle, formId)
    },
    async findAnswerByAttendee(handle, formId, attendeeId) {
      return await formAnswerRepository.findAnswerByAttendee(handle, formId, attendeeId)
    },
  }
}
