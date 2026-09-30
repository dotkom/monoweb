import type { DBHandle } from "@dotkomonline/db"
import { NotFoundError } from "../../error"
import type { AttendeeId } from "../event/attendance"
import type {
  FeedbackFormAnswer,
  FeedbackFormAnswerId,
  FeedbackFormAnswerWrite,
  FeedbackFormId,
  FeedbackPublicResultsToken,
  FeedbackQuestionAnswer,
  FeedbackQuestionAnswerId,
  FeedbackQuestionAnswerWrite,
} from "./feedback-form"
import type { FeedbackFormAnswerRepository } from "./feedback-form-answer-repository"
import type { FeedbackFormService } from "./feedback-form-service"

export interface FeedbackFormAnswerService {
  getById(handle: DBHandle, feedbackFormAnswerId: FeedbackFormAnswerId): Promise<FeedbackFormAnswer>
  create(
    handle: DBHandle,
    formAnswerData: FeedbackFormAnswerWrite,
    questionAnswersData: FeedbackQuestionAnswerWrite[]
  ): Promise<FeedbackFormAnswer>
  findManyByFeedbackFormId(handle: DBHandle, feedbackFormId: FeedbackFormId): Promise<FeedbackFormAnswer[]>
  findManyByPublicResultsToken(
    handle: DBHandle,
    publicResultsToken: FeedbackPublicResultsToken
  ): Promise<FeedbackFormAnswer[]>
  findAnswerByAttendee(
    handle: DBHandle,
    feedbackFormId: FeedbackFormId,
    attendeeId: AttendeeId
  ): Promise<FeedbackFormAnswer | null>
  getQuestionAnswerById(
    handle: DBHandle,
    feedbackQuestionAnswerId: FeedbackQuestionAnswerId
  ): Promise<FeedbackQuestionAnswer>
  deleteQuestionAnswer(handle: DBHandle, feedbackQuestionAnswerId: FeedbackQuestionAnswerId): Promise<void>
}

export function getFeedbackFormAnswerService(
  formAnswerRepository: FeedbackFormAnswerRepository,
  formService: FeedbackFormService
): FeedbackFormAnswerService {
  return {
    async getById(handle, feedbackFormAnswerId) {
      const formAnswer = await formAnswerRepository.findById(handle, feedbackFormAnswerId)
      if (!formAnswer) {
        throw new NotFoundError(`FeedbackFormAnswer(ID=${feedbackFormAnswerId}) not found`)
      }

      return formAnswer
    },

    async create(handle, formAnswerData, questionAnswersData) {
      const validatedQuestionAnswers = questionAnswersData.filter(
        (questionAnswer) => questionAnswer.value !== null || questionAnswer.selectedOptions.length > 0
      )

      return await formAnswerRepository.create(handle, formAnswerData, validatedQuestionAnswers)
    },

    async findManyByFeedbackFormId(handle, feedbackFormId) {
      return await formAnswerRepository.findManyByFeedbackFormId(handle, feedbackFormId)
    },

    async findManyByPublicResultsToken(handle, publicResultsToken) {
      const answers = await formAnswerRepository.findManyByPublicResultsToken(handle, publicResultsToken)
      const form = await formService.getPublicForm(handle, publicResultsToken)

      if (!form) {
        throw new NotFoundError(`FeedbackForm(PublicResultsToken=${publicResultsToken}) not found`)
      }

      const publicQuestionIds = form.questions.map((q) => q.id)

      return answers.map((formAnswer) => ({
        ...formAnswer,
        questionAnswers: formAnswer.questionAnswers.filter((qa) => publicQuestionIds.includes(qa.questionId)),
      }))
    },

    async findAnswerByAttendee(handle, feedbackFormId, attendeeId) {
      return await formAnswerRepository.findAnswerByAttendee(handle, feedbackFormId, attendeeId)
    },

    async getQuestionAnswerById(handle, feedbackQuestionAnswerId) {
      const questionAnswer = await formAnswerRepository.findQuestionAnswerById(handle, feedbackQuestionAnswerId)
      if (!questionAnswer) {
        throw new NotFoundError(`FeedbackQuestionAnswer(ID=${feedbackQuestionAnswerId}) not found`)
      }

      return questionAnswer
    },

    async deleteQuestionAnswer(handle, feedbackQuestionAnswerId) {
      await formAnswerRepository.deleteQuestionAnswer(handle, feedbackQuestionAnswerId)
    },
  }
}
