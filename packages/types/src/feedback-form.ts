import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"

export const FeedbackQuestionOptionSchema = schemas.FeedbackQuestionOptionSchema
export type FeedbackQuestionOption = z.infer<typeof FeedbackQuestionOptionSchema>

export const FeedbackQuestionOptionWriteSchema = schemas.FeedbackQuestionOptionSchema.omit({
  id: true,
  questionId: true,
}).extend({
  id: z.string().optional(),
})
export type FeedbackQuestionOptionWrite = z.infer<typeof FeedbackQuestionOptionWriteSchema>

export const FeedbackQuestionSchema = schemas.FeedbackQuestionSchema.extend({
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

export const FeedbackFormSchema = schemas.FeedbackFormSchema.extend({
  questions: FeedbackQuestionSchema.array(),
}).omit({
  publicResultsToken: true,
})
export type FeedbackForm = z.infer<typeof FeedbackFormSchema>

export const FeedbackQuestionAnswerSchema = schemas.FeedbackQuestionAnswerSchema.omit({
  value: true,
}).extend({
  value: z.union([z.string(), z.number(), z.boolean()]).nullable(),
  selectedOptions: FeedbackQuestionOptionSchema.array(),
})
export type FeedbackQuestionAnswer = z.infer<typeof FeedbackQuestionAnswerSchema>

export const FeedbackQuestionAnswerWriteSchema = FeedbackQuestionAnswerSchema.omit({
  formAnswerId: true,
  id: true,
})
export type FeedbackQuestionAnswerWrite = z.infer<typeof FeedbackQuestionAnswerWriteSchema>

export const FeedbackFormAnswerSchema = schemas.FeedbackFormAnswerSchema.extend({
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

export const FeedbackPublicResultsTokenSchema = schemas.FeedbackFormSchema.shape.publicResultsToken

export type FeedbackPublicResultsToken = z.infer<typeof FeedbackPublicResultsTokenSchema>

export const FeedbackFormWriteSchema = FeedbackFormSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  questions: true,
})

export type FeedbackFormWrite = z.infer<typeof FeedbackFormWriteSchema>
