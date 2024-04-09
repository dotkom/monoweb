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

export const ExtrasSchema = z.array(ExtraSchema).nullable()

export type Extras = z.infer<typeof ExtraSchema>

export const AttendanceSchema = z.object({
  id: z.string().ulid(),
  registerStart: z.date(),
  registerEnd: z.date(),
  deregisterDeadline: z.date(),
  extras: ExtrasSchema,
})

export const AttendanceWriteSchema = AttendanceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export type AttendanceId = Attendance["id"]
