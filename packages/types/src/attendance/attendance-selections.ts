import { z } from "zod"

export const AttendanceSelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export type AttendanceSelection = z.infer<typeof AttendanceSelectionSchema>

export const AttendanceSelectionResponseSchema = z.object({
  selectionId: z.string(),
  selectionName: z.string(),
  optionId: z.string(),
  optionName: z.string(),
})

export type AttendanceSelectionResponse = z.infer<typeof AttendanceSelectionResponseSchema>

export const AttendanceSelectionsResponsesSchema = z.array(AttendanceSelectionResponseSchema)
export type AttendanceSelectionsResponses = AttendanceSelectionResponse[]

export const AttendanceSelectionResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  totalCount: z.number(),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      count: z.number(),
    })
  ),
})

export type AttendanceSelectionResults = z.infer<typeof AttendanceSelectionResultSchema>
