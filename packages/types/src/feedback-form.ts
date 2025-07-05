import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"

//TODO: Clean up types
export const FeedbackQuestionOptionSchema = schemas.FeedbackQuestionOptionSchema
export type FeedbackQuestionOption = z.infer<typeof FeedbackQuestionOptionSchema>

export const FeedbackQuestionOptionIdSchema = FeedbackQuestionOptionSchema.shape.id
export type FeedbackQuestionOptionId = z.infer<typeof FeedbackQuestionOptionIdSchema>

export const FeedbackQuestionOptionWriteSchema = schemas.FeedbackQuestionOptionSchema.omit({
  id: true,
  questionId: true,
})
export const FeedbackQuestionOptionUpdateSchema = schemas.FeedbackQuestionOptionSchema.omit({
  id: true,
  questionId: true,
}).extend({
  id: z.string().optional(),
})
export type FeedbackQuestionOptionWrite = z.infer<typeof FeedbackQuestionOptionWriteSchema>
export type FeedbackQuestionOptionUpdate = z.infer<typeof FeedbackQuestionOptionUpdateSchema>

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
  options: FeedbackQuestionOptionUpdateSchema.array(),
})
export type FeedbackQuestionWrite = z.infer<typeof FeedbackQuestionWriteSchema>

export const FeedbackQuestionUpdateSchema = FeedbackQuestionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  feedbackFormId: true,
  options: true,
}).extend({
  options: FeedbackQuestionOptionUpdateSchema.array(),
  id: z.string().optional(),
})
export type FeedbackQuestionUpdate = z.infer<typeof FeedbackQuestionUpdateSchema>

export const FeedbackQuestionUpsertSchema = FeedbackQuestionWriteSchema.extend({
  id: z.string().optional(),
})
export type FeedbackQuestionUpsert = z.infer<typeof FeedbackQuestionUpsertSchema>

export const FeedbackFormSchema = schemas.FeedbackFormSchema.extend({
  questions: FeedbackQuestionSchema.array(),
  //TODO: Add answers
})
export type FeedbackForm = z.infer<typeof FeedbackFormSchema>

export const FeedbackQuestionAnswerSchema = schemas.FeedbackQuestionAnswerSchema.omit({
  value: true,
}).extend({
  value: z.union([z.string(), z.number(), z.boolean()]).nullable(),
  selectedOptions: FeedbackQuestionOptionSchema.array(),
})

export type FeedbackQuestionAnswer = z.infer<typeof FeedbackQuestionAnswerSchema>

export const FeedbackFormAnswerSchema = schemas.FeedbackFormAnswerSchema
export type FeedbackFormAnswer = z.infer<typeof FeedbackFormAnswerSchema>

export type FeedbackQuestionType = FeedbackQuestion["type"]

export const FeedbackQuestionIdSchema = FeedbackQuestionSchema.shape.id

export type FeedbackQuestionId = z.infer<typeof FeedbackQuestionIdSchema>

export const FeedbackFormIdSchema = FeedbackFormSchema.shape.id

export type FeedbackFormId = z.infer<typeof FeedbackFormIdSchema>

export const FeedbackFormWriteSchema = FeedbackFormSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  questions: true,
})

export type FeedbackFormWrite = z.infer<typeof FeedbackFormWriteSchema>
