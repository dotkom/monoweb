import {
  type FeedbackQuestionAnswer as DBFeedbackQuestionAnswer,
  type FeedbackQuestionOption as DBFeedbackQuestionOption,
  type DBHandle,
  Prisma,
} from "@dotkomonline/db"
import { parseOrReport } from "../../invariant"
import type { AttendeeId } from "../event/attendance"
import {
  type FeedbackFormAnswer,
  type FeedbackFormAnswerId,
  FeedbackFormAnswerSchema,
  type FeedbackFormAnswerWrite,
  type FeedbackFormId,
  type FeedbackPublicResultsToken,
  type FeedbackQuestionAnswer,
  type FeedbackQuestionAnswerId,
  FeedbackQuestionAnswerSchema,
  type FeedbackQuestionAnswerWrite,
} from "./feedback-form"

export interface FeedbackFormAnswerRepository {
  findById(handle: DBHandle, feedbackFormAnswerId: FeedbackFormAnswerId): Promise<FeedbackFormAnswer | null>
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
  findQuestionAnswerById(
    handle: DBHandle,
    feedbackQuestionAnswerId: FeedbackQuestionAnswerId
  ): Promise<FeedbackQuestionAnswer | null>
  findAnswerByAttendee(
    handle: DBHandle,
    feedbackFormId: FeedbackFormId,
    attendeeId: AttendeeId
  ): Promise<FeedbackFormAnswer | null>
  deleteQuestionAnswer(handle: DBHandle, feedbackQuestionAnswerId: FeedbackQuestionAnswerId): Promise<void>
}

export function getFeedbackFormAnswerRepository(): FeedbackFormAnswerRepository {
  return {
    async findById(handle, feedbackFormAnswerId) {
      const formAnswer = await handle.feedbackFormAnswer.findUnique({
        where: {
          id: feedbackFormAnswerId,
        },
        include: QUERY_WITH_ANSWERS,
      })

      if (formAnswer === null) {
        return null
      }

      return mapFormAnswer(formAnswer, formAnswer.answers)
    },

    async create(handle, formAnswerData, questionAnswersData) {
      const answer = await handle.feedbackFormAnswer.create({
        data: {
          ...formAnswerData,
          answers: {
            create: questionAnswersData.map((questionAnswer) => ({
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

    async findManyByFeedbackFormId(handle, feedbackFormId) {
      const formAnswers = await handle.feedbackFormAnswer.findMany({
        where: {
          feedbackFormId,
        },
        include: QUERY_WITH_ANSWERS,
      })

      return formAnswers.map((answer) => mapFormAnswer(answer, answer.answers))
    },

    async findManyByPublicResultsToken(handle, publicResultsToken) {
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

    async findQuestionAnswerById(handle, feedbackQuestionAnswerId) {
      const questionAnswer = await handle.feedbackQuestionAnswer.findUnique({
        where: {
          id: feedbackQuestionAnswerId,
        },
        include: {
          selectedOptions: {
            include: {
              feedbackQuestionOption: true,
            },
          },
        },
      })

      if (questionAnswer === null) {
        return null
      }

      return parseOrReport(FeedbackQuestionAnswerSchema, {
        id: questionAnswer.id,
        questionId: questionAnswer.questionId,
        formAnswerId: questionAnswer.formAnswerId,
        value: FeedbackQuestionAnswerSchema.shape.value.parse(questionAnswer.value),
        selectedOptions: questionAnswer.selectedOptions.map((link) => ({
          id: link.feedbackQuestionOption.id,
          questionId: link.feedbackQuestionOption.questionId,
          name: link.feedbackQuestionOption.name,
        })),
      })
    },

    async findAnswerByAttendee(handle, feedbackFormId, attendeeId) {
      const answer = await handle.feedbackFormAnswer.findFirst({
        where: {
          feedbackFormId,
          attendeeId: attendeeId,
        },
        include: QUERY_WITH_ANSWERS,
      })

      if (answer === null) {
        return null
      }

      return mapFormAnswer(answer, answer.answers)
    },

    async deleteQuestionAnswer(handle, feedbackQuestionAnswerId) {
      await handle.feedbackQuestionAnswer.delete({
        where: {
          id: feedbackQuestionAnswerId,
        },
      })
    },
  }
}

function mapFormAnswer(
  formAnswer: Omit<FeedbackFormAnswer, "questionAnswers">,
  questionAnswers: (DBFeedbackQuestionAnswer & {
    selectedOptions: {
      feedbackQuestionOption: DBFeedbackQuestionOption
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

  return parseOrReport(FeedbackFormAnswerSchema, {
    ...formAnswer,
    questionAnswers: parsedAnswers,
  })
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
} as const satisfies Prisma.FeedbackFormAnswerInclude
