import type { DBClient, Prisma } from "@dotkomonline/db"
import type { EventId, FeedbackForm, FeedbackFormId, FeedbackFormWrite } from "@dotkomonline/types"

export interface FeedbackFormRepository {
  create(data: FeedbackFormWrite): Promise<FeedbackForm>
  update(id: FeedbackFormId, data: FeedbackFormWrite): Promise<FeedbackForm>
  delete(id: FeedbackFormId): Promise<void>
  getByEventId(eventId: EventId): Promise<FeedbackForm | null>
  getById(id: FeedbackFormId): Promise<FeedbackForm | null>
}

export class FeedbackFormRepositoryImpl implements FeedbackFormRepository {
  private readonly db: DBClient

  constructor(db: DBClient) {
    this.db = db
  }

  private includeQuestions = {
    questions: { include: { options: true } },
  }

  public async create(data: FeedbackFormWrite) {
    const { questions, ...form } = data

    const feedbackForm = await this.db.feedbackForm.create({
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
      include: this.includeQuestions,
    })

    return feedbackForm
  }

  public async update(id: FeedbackFormId, data: FeedbackFormWrite) {
    const { questions, ...form } = data

    const feedbackForm = await this.db.feedbackForm.update({
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
      include: this.includeQuestions,
    })

    return feedbackForm
  }

  public async delete(id: FeedbackFormId) {
    await this.db.feedbackForm.delete({
      where: {
        id: id,
      },
    })
  }

  public async getById(id: FeedbackFormId) {
    return await this.db.feedbackForm.findFirst({
      where: {
        id: id,
      },
      include: this.includeQuestions,
    })
  }

  public async getByEventId(eventId: EventId) {
    const feedbackForm = await this.db.feedbackForm.findFirst({
      where: {
        eventId: eventId,
      },
      include: this.includeQuestions,
    })

    return feedbackForm
  }
}
