import type { DBHandle, Prisma } from "@dotkomonline/db"
import type { EventId, FeedbackForm, FeedbackFormId, FeedbackFormWrite } from "@dotkomonline/types"

export interface FeedbackFormRepository {
  create(handle: DBHandle, data: FeedbackFormWrite): Promise<FeedbackForm>
  update(handle: DBHandle, id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  delete(handle: DBHandle, id: FeedbackFormId): Promise<void>
  getById(handle: DBHandle, id: FeedbackFormId): Promise<FeedbackForm | null>
  getByEventId(handle: DBHandle, eventId: EventId): Promise<FeedbackForm | null>
}

export function getFeedbackFormRepository(): FeedbackFormRepository {
  return {
    async create(handle, data) {
      const { questions, ...form } = data

      const feedbackForm = await handle.feedbackForm.create({
        data: {
          ...form,
          questions: {
            create: questions.map((question) => ({
              label: question.label,
              order: question.order,
              type: question.type,
              required: question.required,
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

      return feedbackForm
    },
    async update(handle, id, data) {
      const { questions, ...form } = data

      const feedbackForm = await handle.feedbackForm.update({
        where: { id },
        data: {
          ...form,
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
                options: {
                  create: q.options.map((opt) => ({ name: opt.name })),
                },
              },
              update: {
                label: q.label,
                order: q.order,
                type: q.type,
                required: q.required,
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

      return feedbackForm
    },
    async delete(handle, id) {
      await handle.feedbackForm.delete({
        where: {
          id: id,
        },
      })
    },
    async getById(handle, id) {
      return await handle.feedbackForm.findFirst({
        where: {
          id: id,
        },
        include: QUERY_WITH_QUESTIONS,
      })
    },
    async getByEventId(handle, eventId) {
      const feedbackForm = handle.feedbackForm.findFirst({
        where: {
          eventId: eventId,
        },
        include: QUERY_WITH_QUESTIONS,
      })

      return feedbackForm
    },
  }
}

const QUERY_WITH_QUESTIONS = {
  questions: { include: { options: true } },
} as const
