import { schemas } from "@dotkomonline/db"
import { z } from "zod"
import { AttendancePoolSchema } from "./attendance-pool"
import { AttendanceQuestionSchema } from "./attendance-questions"

export const AttendanceSchema = schemas.AttendanceSchema.extend({
  pools: z.array(AttendancePoolSchema),
  questions: z.array(AttendanceQuestionSchema),
})

export const AttendanceWriteSchema = AttendanceSchema.omit({
  pools: true,
  id: true,
  updatedAt: true,
  createdAt: true,
})

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export type AttendanceId = Attendance["id"]
