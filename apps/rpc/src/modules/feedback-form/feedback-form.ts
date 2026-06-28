import { buildLimitedDepthJsonSchema } from "@dotkomonline/utils"
import { z } from "zod"

export const FeedbackQuestionTypeSchema = z.enum(["TEXT", "LONGTEXT", "RATING", "CHECKBOX", "SELECT", "MULTISELECT"])

export const FeedbackQuestionOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  questionId: z.string(),
})
export type FeedbackQuestionOption = z.infer<typeof FeedbackQuestionOptionSchema>

export const FeedbackQuestionOptionWriteSchema = FeedbackQuestionOptionSchema.omit({
  id: true,
  questionId: true,
}).extend({
  id: z.string().optional(),
})
export type FeedbackQuestionOptionWrite = z.infer<typeof FeedbackQuestionOptionWriteSchema>

export const FeedbackQuestionSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    required: z.boolean(),
    showInPublicResults: z.boolean().default(true),
    type: FeedbackQuestionTypeSchema,
    order: z.number().int(),
    createdAt: z.date(),
    updatedAt: z.date(),
    feedbackFormId: z.string(),
  })
  .extend({
    options: FeedbackQuestionOptionSchema.array(),
  })
export type FeedbackQuestion = z.infer<typeof FeedbackQuestionSchema>

export const FeedbackQuestionWriteSchema = FeedbackQuestionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  feedbackFormId: true,
  options: true,
}).extend({
  options: FeedbackQuestionOptionWriteSchema.array(),
  id: z.string().optional(),
})
export type FeedbackQuestionWrite = z.infer<typeof FeedbackQuestionWriteSchema>

const FeedbackFormBaseSchema = z.object({
  id: z.string(),
  publicResultsToken: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  answerDeadline: z.date(),
  eventId: z.string(),
})

export const FeedbackFormSchema = FeedbackFormBaseSchema.extend({
  questions: FeedbackQuestionSchema.array(),
}).omit({
  publicResultsToken: true,
})
export type FeedbackForm = z.infer<typeof FeedbackFormSchema>

export const FeedbackFromPublicResultsTokenSchema = FeedbackFormBaseSchema.pick({ publicResultsToken: true })

export const FeedbackQuestionAnswerSchema = z
  .object({
    id: z.string(),
    value: buildLimitedDepthJsonSchema().nullable(),
    questionId: z.string(),
    formAnswerId: z.string(),
  })
  .omit({
    value: true,
  })
  .extend({
    value: z.union([z.string(), z.number(), z.boolean()]).nullable(),
    selectedOptions: FeedbackQuestionOptionSchema.array(),
  })
export type FeedbackQuestionAnswer = z.infer<typeof FeedbackQuestionAnswerSchema>
export type FeedbackQuestionAnswerId = FeedbackQuestionAnswer["id"]

export const FeedbackQuestionAnswerWriteSchema = FeedbackQuestionAnswerSchema.omit({
  formAnswerId: true,
  id: true,
})
export type FeedbackQuestionAnswerWrite = z.infer<typeof FeedbackQuestionAnswerWriteSchema>

export const FeedbackFormAnswerSchema = z
  .object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    feedbackFormId: z.string(),
    attendeeId: z.string(),
  })
  .extend({
    questionAnswers: FeedbackQuestionAnswerSchema.array(),
  })
export type FeedbackFormAnswer = z.infer<typeof FeedbackFormAnswerSchema>

export const FeedbackFormAnswerWriteSchema = FeedbackFormAnswerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  questionAnswers: true,
})
export type FeedbackFormAnswerWrite = z.infer<typeof FeedbackFormAnswerWriteSchema>

export type FeedbackQuestionType = FeedbackQuestion["type"]

export const FeedbackFormIdSchema = FeedbackFormSchema.shape.id

export type FeedbackFormId = z.infer<typeof FeedbackFormIdSchema>

export const FeedbackPublicResultsTokenSchema = FeedbackFormBaseSchema.shape.publicResultsToken

export type FeedbackPublicResultsToken = z.infer<typeof FeedbackPublicResultsTokenSchema>

export const FeedbackFormWriteSchema = FeedbackFormSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  questions: true,
})

export type FeedbackFormWrite = z.infer<typeof FeedbackFormWriteSchema>

export const getFeedbackQuestionTypeName = (type: FeedbackQuestionType) => {
  switch (type) {
    case "TEXT":
      return "Tekstboks"
    case "LONGTEXT":
      return "Tekstfelt"
    case "CHECKBOX":
      return "Avkrysningsboks"
    case "MULTISELECT":
      return "Flervalg"
    case "SELECT":
      return "Enkeltvalg"
    case "RATING":
      return "Vurdering"
    default:
      return "Ukjent type"
  }
}

export type FeedbackRejectionCause = keyof typeof FeedbackRejectionCause
export const FeedbackRejectionCause = {
  NO_FEEDBACK_FORM: "NO_FEEDBACK_FORM",
  TOO_EARLY: "TOO_EARLY",
  TOO_LATE: "TOO_LATE",
  ALREADY_ANSWERED: "ALREADY_ANSWERED",
  DID_NOT_ATTEND: "DID_NOT_ATTEND",
} as const
