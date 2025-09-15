import type { DBHandle } from "@dotkomonline/db"
import type {
  AttendeeId,
  FeedbackFormAnswer,
  FeedbackFormAnswerWrite,
  FeedbackFormId,
  FeedbackPublicResultsToken,
  FeedbackQuestionAnswer,
  FeedbackQuestionAnswerWrite,
} from "@dotkomonline/types"
import { NotFoundError } from "../../error"
import type { FeedbackFormAnswerRepository } from "./feedback-form-answer-repository"
import type { FeedbackFormService } from "./feedback-form-service"

export interface FeedbackFormAnswerService {
  create(
    handle: DBHandle,
    formAnswer: FeedbackFormAnswerWrite,
    questionAnswers: FeedbackQuestionAnswerWrite[]
  ): Promise<FeedbackFormAnswer>
  getAllAnswers(handle: DBHandle, formId: FeedbackFormId): Promise<FeedbackFormAnswer[]>
  getPublicAnswers(handle: DBHandle, publicResultsToken: FeedbackPublicResultsToken): Promise<FeedbackFormAnswer[]>
  findAnswerByAttendee(
    handle: DBHandle,
    formId: FeedbackFormId,
    attendeeId: AttendeeId
  ): Promise<FeedbackFormAnswer | null>
  deleteQuestionAnswer(handle: DBHandle, id: FeedbackQuestionAnswer["id"]): Promise<void>
}

export function getFeedbackFormAnswerService(
  formAnswerRepository: FeedbackFormAnswerRepository,
  formService: FeedbackFormService
): FeedbackFormAnswerService {
  return {
    async create(handle, formAnswer, questionAnswers) {
      const validatedQuestionAnswers = questionAnswers.filter(
        (questionAnswer) => questionAnswer.value !== null || questionAnswer.selectedOptions.length > 0
      )

      return await formAnswerRepository.create(handle, formAnswer, validatedQuestionAnswers)
    },
    async getAllAnswers(handle, formId) {
      return await formAnswerRepository.getAllAnswers(handle, formId)
    },
    async getPublicAnswers(handle, publicResultsToken) {
      const answers = await formAnswerRepository.getAnswersByPublicResultsToken(handle, publicResultsToken)
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
    async findAnswerByAttendee(handle, formId, attendeeId) {
      return await formAnswerRepository.findAnswerByAttendee(handle, formId, attendeeId)
    },
    async deleteQuestionAnswer(handle, id) {
      await formAnswerRepository.deleteQuestionAnswer(handle, id)
    },
  }
}
