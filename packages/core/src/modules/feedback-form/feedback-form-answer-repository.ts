import type {
  DBClient,
  FeedbackFormAnswer as DBFeedbackFormAnswer,
  FeedbackQuestionAnswer,
  FeedbackQuestionAnswerOptionLink,
  FeedbackQuestionOption,
} from "@dotkomonline/db"
import {
  type AttendeeId,
  type FeedbackFormAnswer,
  type FeedbackFormAnswerWrite,
  type FeedbackFormId,
  FeedbackQuestionAnswerSchema,
} from "@dotkomonline/types"
import { Prisma } from "@prisma/client"

type FeedbackFormAnswerWithAnswers = DBFeedbackFormAnswer & {
  answers: (FeedbackQuestionAnswer & {
    selectedOptions: (FeedbackQuestionAnswerOptionLink & {
      feedbackQuestionOption: FeedbackQuestionOption
    })[]
  })[]
}

export interface FeedbackFormAnswerRepository {
  create(data: FeedbackFormAnswerWrite): Promise<FeedbackFormAnswer>
  getAllAnswers(formId: FeedbackFormId): Promise<FeedbackFormAnswer[]>
  findAnswerByAttendee(formId: FeedbackFormId, attendeeId: AttendeeId): Promise<FeedbackFormAnswer | null>
}

export class FeedbackFormAnswerRepositoryImpl implements FeedbackFormAnswerRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  private includeAnswers = {
    answers: {
      include: {
        selectedOptions: {
          include: {
            feedbackQuestionOption: true,
          },
        },
      },
    },
  }

  public async create(data: FeedbackFormAnswerWrite) {
    const { questionAnswers, ...formAnswer } = data

    const answer = await this.db.feedbackFormAnswer.create({
      data: {
        ...formAnswer,
        answers: {
          create: data.questionAnswers.map((questionAnswer) => ({
            value: questionAnswer.value ?? Prisma.JsonNull,
            question: {
              connect: { id: questionAnswer.questionId },
            },
            selectedOptions: {
              create: questionAnswer.selectedOptions.map(
                (selectedOption): Prisma.FeedbackQuestionAnswerOptionLinkCreateWithoutFeedbackQuestionAnswerInput => ({
                  feedbackQuestionOption: {
                    connect: { id: selectedOption.id },
                  },
                })
              ),
            },
          })),
        },
      },
      include: this.includeAnswers,
    })

    return this.mapFormAnswer(answer)
  }

  public async getAllAnswers(formId: FeedbackFormId) {
    const answers = await this.db.feedbackFormAnswer.findMany({
      where: {
        feedbackFormId: formId,
      },
      include: this.includeAnswers,
    })

    return answers.map(this.mapFormAnswer)
  }

  public async findAnswerByAttendee(formId: FeedbackFormId, attendeeId: AttendeeId) {
    const answer = await this.db.feedbackFormAnswer.findFirst({
      where: {
        feedbackFormId: formId,
        attendeeId: attendeeId,
      },
      include: this.includeAnswers,
    })

    if (!answer) return null

    return this.mapFormAnswer(answer)
  }

  private mapFormAnswer(answer: FeedbackFormAnswerWithAnswers): FeedbackFormAnswer {
    const { answers, ...rest } = answer

    const parsedAnswers = answers.map((ans) => ({
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
      ...rest,
      questionAnswers: parsedAnswers,
    }
  }
}
