import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"

export const FeedbackFormQuestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "checkbox", "select", "slider"]),
  required: z.boolean(),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export type FeedbackFormQuestion = z.infer<typeof FeedbackFormQuestionSchema>

export const FeedbackFormSchema = schemas.FeedbackFormSchema.omit({
  questions: true,
}).extend({
  questions: z.array(FeedbackFormQuestionSchema),
})

export type FeedbackForm = z.infer<typeof FeedbackFormSchema>

export const FeedbackFormIdSchema = FeedbackFormSchema.shape.id

export type FeedbackFormId = z.infer<typeof FeedbackFormIdSchema>

export const FeedbackFormWriteSchema = FeedbackFormSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type FeedbackFormWrite = z.infer<typeof FeedbackFormWriteSchema>
