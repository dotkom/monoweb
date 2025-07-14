import type { DBHandle, FeedbackQuestionAnswer, FeedbackQuestionOption } from "@dotkomonline/db"
import {
  type AttendeeId,
  type FeedbackFormAnswer,
  type FeedbackFormAnswerWrite,
  type FeedbackFormId,
  type FeedbackPublicResultsToken,
  FeedbackQuestionAnswerSchema,
  type FeedbackQuestionAnswerWrite,
} from "@dotkomonline/types"
import { Prisma } from "@prisma/client"

export interface FeedbackFormAnswerRepository {
  create(
    handle: DBHandle,
    formAnswer: FeedbackFormAnswerWrite,
    questionAnswers: FeedbackQuestionAnswerWrite[]
  ): Promise<FeedbackFormAnswer>
  getAllAnswers(handle: DBHandle, formId: FeedbackFormId): Promise<FeedbackFormAnswer[]>
  getAnswersByPublicResultsToken(
    handle: DBHandle,
    publicResultsToken: FeedbackPublicResultsToken
  ): Promise<FeedbackFormAnswer[]>
  findAnswerByAttendee(
    handle: DBHandle,
    formId: FeedbackFormId,
    attendeeId: AttendeeId
  ): Promise<FeedbackFormAnswer | null>
}

export function getFeedbackFormAnswerRepository(): FeedbackFormAnswerRepository {
  return {
    async create(handle, formAnswer, questionAnswers) {
      const answer = await handle.feedbackFormAnswer.create({
        data: {
          ...formAnswer,
          answers: {
            create: questionAnswers.map((questionAnswer) => ({
              value: questionAnswer.value ?? Prisma.JsonNull,
              question: {
                connect: { id: questionAnswer.questionId },
              },
              selectedOptions: {
                create: questionAnswer.selectedOptions.map(
                  (
                    selectedOption
                  ): Prisma.FeedbackQuestionAnswerOptionLinkCreateWithoutFeedbackQuestionAnswerInput => ({
                    feedbackQuestionOption: {
                      connect: { id: selectedOption.id },
                    },
                  })
                ),
              },
            })),
          },
        },
        include: QUERY_WITH_ANSWERS,
      })

      return mapFormAnswer(answer, answer.answers)
    },
    async getAllAnswers(handle, formId) {
      const formAnswers = await handle.feedbackFormAnswer.findMany({
        where: {
          feedbackFormId: formId,
        },
        include: QUERY_WITH_ANSWERS,
      })

      return formAnswers.map((answer) => mapFormAnswer(answer, answer.answers))
    },
    async getAnswersByPublicResultsToken(handle, publicResultsToken) {
      const formAnswers = await handle.feedbackFormAnswer.findMany({
        where: {
          feedbackForm: {
            publicResultsToken: publicResultsToken,
          },
        },
        include: QUERY_WITH_ANSWERS,
      })

      return formAnswers.map((answer) => mapFormAnswer(answer, answer.answers))
    },
    async findAnswerByAttendee(handle, formId, attendeeId) {
      const answer = await handle.feedbackFormAnswer.findFirst({
        where: {
          feedbackFormId: formId,
          attendeeId: attendeeId,
        },
        include: QUERY_WITH_ANSWERS,
      })

      if (!answer) return null

      return mapFormAnswer(answer, answer.answers)
    },
  }
}

function mapFormAnswer(
  formAnswer: Omit<FeedbackFormAnswer, "questionAnswers">,
  questionAnswers: (FeedbackQuestionAnswer & {
    selectedOptions: {
      feedbackQuestionOption: FeedbackQuestionOption
    }[]
  })[]
): FeedbackFormAnswer {
  const parsedAnswers = questionAnswers.map((ans) => ({
    id: ans.id,
    questionId: ans.questionId,
    formAnswerId: ans.formAnswerId,
    value: FeedbackQuestionAnswerSchema.shape.value.parse(ans.value),
    selectedOptions: ans.selectedOptions.map((link) => ({
      id: link.feedbackQuestionOption.id,
      questionId: link.feedbackQuestionOption.questionId,
      name: link.feedbackQuestionOption.name,
    })),
  }))

  return {
    ...formAnswer,
    questionAnswers: parsedAnswers,
  }
}

const QUERY_WITH_ANSWERS = {
  answers: {
    include: {
      selectedOptions: {
        include: {
          feedbackQuestionOption: true,
        },
      },
    },
  },
} as const
