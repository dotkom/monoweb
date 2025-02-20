import { z } from "zod"

export const AttendanceQuestionSchema = z.object({
  id: z.string(),
  name: z.string(),
  choices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export type AttendanceQuestion = z.infer<typeof AttendanceQuestionSchema>

export const AttendanceQuestionResponseSchema = z.object({
  questionId: z.string(),
  choiceId: z.string(),
  choiceName: z.string(),
  questionName: z.string(),
})

export type AttendanceQuestionResponse = z.infer<typeof AttendanceQuestionResponseSchema>

export const AttendanceQuestionResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalCount: z.number(),
  choices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      count: z.number(),
    })
  ),
})

export type AttendanceQuestionResults = z.infer<typeof AttendanceQuestionResultSchema>
