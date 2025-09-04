import type { DBHandle, Prisma } from "@dotkomonline/db"
import {
  type EventId,
  type FeedbackForm,
  type FeedbackFormId,
  FeedbackFormSchema,
  type FeedbackFormWrite,
  type FeedbackPublicResultsToken,
  type FeedbackQuestionWrite,
  type UserId,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface FeedbackFormRepository {
  create(handle: DBHandle, feedbackForm: FeedbackFormWrite, questions: FeedbackQuestionWrite[]): Promise<FeedbackForm>
  update(
    handle: DBHandle,
    id: FeedbackFormId,
    feedbackForm: FeedbackFormWrite,
    questions: FeedbackQuestionWrite[]
  ): Promise<FeedbackForm>
  delete(handle: DBHandle, id: FeedbackFormId): Promise<void>
  getById(handle: DBHandle, id: FeedbackFormId): Promise<FeedbackForm | null>
  getByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm | null>
  getByPublicResultsToken(
    handle: DBHandle,
    publicResultsToken: FeedbackPublicResultsToken
  ): Promise<FeedbackForm | null>
  getPublicResultsToken(handle: DBHandle, id: FeedbackFormId): Promise<FeedbackPublicResultsToken | null>
  findManyByUserNotAnswered(handle: DBHandle, userId: UserId): Promise<FeedbackForm[]>
}

export function getFeedbackFormRepository(): FeedbackFormRepository {
  return {
    async create(handle, feedbackForm, questions) {
      const form = await handle.feedbackForm.create({
        data: {
          ...feedbackForm,
          questions: {
            create: questions.map((question) => ({
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
    async update(handle, id, feedbackForm, questions) {
      const form = await handle.feedbackForm.update({
        where: { id },
        data: {
          ...feedbackForm,
          questions: {
            deleteMany: {
              feedbackFormId: id,
              id: {
                notIn: questions.map(({ id }) => id).filter((id) => id !== undefined),
              },
            },
            upsert: questions.map((q) => ({
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
    async delete(handle, id) {
      await handle.feedbackForm.delete({
        where: {
          id: id,
        },
      })
    },
    async getById(handle, id) {
      const form = await handle.feedbackForm.findUnique({
        where: {
          id: id,
        },
        include: QUERY_WITH_QUESTIONS,
        omit: {
          publicResultsToken: true,
        },
      })
      return form ? parseOrReport(FeedbackFormSchema, form) : null
    },
    async getByEventId(handle, eventId) {
      const form = await handle.feedbackForm.findFirst({
        where: {
          eventId: eventId,
        },
        include: QUERY_WITH_QUESTIONS,
        omit: {
          publicResultsToken: true,
        },
      })

      return form ? parseOrReport(FeedbackFormSchema, form) : null
    },
    async getByPublicResultsToken(handle, publicResultsToken) {
      const form = await handle.feedbackForm.findUnique({
        where: {
          publicResultsToken: publicResultsToken,
        },
        include: QUERY_WITH_QUESTIONS,
      })

      return form ? parseOrReport(FeedbackFormSchema, form) : null
    },
    async getPublicResultsToken(handle, id) {
      const result = await handle.feedbackForm.findUnique({
        where: {
          id: id,
        },
        select: {
          publicResultsToken: true,
        },
      })

      return result?.publicResultsToken ?? null
    },
    async findManyByUserNotAnswered(handle, userId) {
      const rows = await handle.feedbackForm.findMany({
        where: {
          AND: [
            {
              isActive: true,
            },
            {
              event: {
                attendance: {
                  attendees: {
                    some: {
                      userId,
                    },
                  },
                },
                end: {
                  lt: new Date(),
                },
              },
            },
            {
              answers: {
                none: {
                  attendee: {
                    userId,
                  },
                },
              },
            },
          ],
        },
        include: QUERY_WITH_QUESTIONS,
      })

      return parseOrReport(FeedbackFormSchema.array(), rows)
    },
  }
}

const QUERY_WITH_QUESTIONS = {
  questions: { include: { options: true } },
} as const
