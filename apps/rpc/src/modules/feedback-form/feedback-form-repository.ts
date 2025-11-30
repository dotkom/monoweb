import type { DBHandle, Prisma } from "@dotkomonline/db"
import {
  type EventId,
  type FeedbackForm,
  type FeedbackFormId,
  FeedbackFormSchema,
  type FeedbackFormWrite,
  FeedbackFromPublicResultsTokenSchema,
  type FeedbackPublicResultsToken,
  type FeedbackQuestionWrite,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface FeedbackFormRepository {
  create(
    handle: DBHandle,
    feedbackFormData: FeedbackFormWrite,
    questionsData: FeedbackQuestionWrite[]
  ): Promise<FeedbackForm>
  update(
    handle: DBHandle,
    feedbackFormId: FeedbackFormId,
    feedbackFormData: FeedbackFormWrite,
    questionsData: FeedbackQuestionWrite[]
  ): Promise<FeedbackForm>
  delete(handle: DBHandle, feedbackFormId: FeedbackFormId): Promise<void>
  findById(handle: DBHandle, feedbackFormId: FeedbackFormId): Promise<FeedbackForm | null>
  findByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm | null>
  findByPublicResultsToken(
    handle: DBHandle,
    publicResultsToken: FeedbackPublicResultsToken
  ): Promise<FeedbackForm | null>
  findPublicResultsToken(handle: DBHandle, feedbackFormId: FeedbackFormId): Promise<FeedbackPublicResultsToken | null>
}

export function getFeedbackFormRepository(): FeedbackFormRepository {
  return {
    async create(handle, feedbackFormData, questionsData) {
      const form = await handle.feedbackForm.create({
        data: {
          ...feedbackFormData,
          questions: {
            create: questionsData.map((question) => ({
              label: question.label,
              order: question.order,
              type: question.type,
              required: question.required,
              showInPublicResults: question.showInPublicResults,
              options: {
                create: question.options.map(
                  (option): Prisma.FeedbackQuestionOptionCreateWithoutQuestionInput => ({
                    name: option.name,
                  })
                ),
              },
            })),
          },
        },
        include: QUERY_WITH_QUESTIONS,
      })

      return parseOrReport(FeedbackFormSchema, form)
    },

    async update(handle, feedbackFormId, feedbackFormData, questionsData) {
      const form = await handle.feedbackForm.update({
        where: { id: feedbackFormId },
        data: {
          ...feedbackFormData,
          questions: {
            deleteMany: {
              feedbackFormId,
              id: {
                notIn: questionsData.map(({ id }) => id).filter((id) => id !== undefined),
              },
            },
            upsert: questionsData.map((q) => ({
              where: { id: q.id ?? "" },
              create: {
                label: q.label,
                order: q.order,
                type: q.type,
                required: q.required,
                showInPublicResults: q.showInPublicResults,
                options: {
                  create: q.options.map((opt) => ({ name: opt.name })),
                },
              },
              update: {
                label: q.label,
                order: q.order,
                type: q.type,
                required: q.required,
                showInPublicResults: q.showInPublicResults,
                options: {
                  deleteMany: {
                    questionId: q.id,
                    id: {
                      notIn: q.options.map(({ id }) => id).filter((id) => id !== undefined),
                    },
                  },
                  upsert: q.options.map((opt) => ({
                    where: { id: opt.id ?? "" },
                    update: { name: opt.name },
                    create: { name: opt.name },
                  })),
                },
              },
            })),
          },
        },
        include: QUERY_WITH_QUESTIONS,
      })

      return parseOrReport(FeedbackFormSchema, form)
    },

    async delete(handle, feedbackFormId) {
      await handle.feedbackForm.delete({
        where: {
          id: feedbackFormId,
        },
      })
    },

    async findById(handle, feedbackFormId) {
      const form = await handle.feedbackForm.findUnique({
        where: {
          id: feedbackFormId,
        },
        include: QUERY_WITH_QUESTIONS,
        omit: {
          publicResultsToken: true,
        },
      })

      return parseOrReport(FeedbackFormSchema.nullable(), form)
    },

    async findByEventId(handle, eventId) {
      const form = await handle.feedbackForm.findFirst({
        where: {
          eventId: eventId,
        },
        include: QUERY_WITH_QUESTIONS,
        omit: {
          publicResultsToken: true,
        },
      })

      return parseOrReport(FeedbackFormSchema.nullable(), form)
    },

    async findByPublicResultsToken(handle, publicResultsToken) {
      const form = await handle.feedbackForm.findUnique({
        where: {
          publicResultsToken: publicResultsToken,
        },
        include: QUERY_WITH_QUESTIONS,
      })

      return parseOrReport(FeedbackFormSchema.nullable(), form)
    },

    async findPublicResultsToken(handle, feedbackFormId) {
      const result = await handle.feedbackForm.findUnique({
        where: {
          id: feedbackFormId,
        },
        select: {
          publicResultsToken: true,
        },
      })

      return parseOrReport(FeedbackFromPublicResultsTokenSchema, result).publicResultsToken
    },
  }
}

const QUERY_WITH_QUESTIONS = {
  questions: {
    include: {
      options: true,
    },
  },
} as const satisfies Prisma.FeedbackFormInclude
