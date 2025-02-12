import { dbSchemas } from "@dotkomonline/db"
import { z } from "zod"

export const ExtraSchema = z.object({
  id: z.string(),
  name: z.string(),
  choices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export const ExtraResultsSchema = z.object({
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
export type ExtraResults = z.infer<typeof ExtraResultsSchema>

export const ExtrasSchema = z.array(ExtraSchema).nullable()

export type Extras = z.infer<typeof ExtraSchema>

export const AttendanceSchema = dbSchemas.AttendanceSchema.extend({
  extras: ExtrasSchema,
})

export const AttendanceWriteSchema = AttendanceSchema.omit({
  id: true,
  updatedAt: true,
  createdAt: true,
})

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export type AttendanceId = Attendance["id"]
