import { buildLimitedDepthJsonSchema } from "@dotkomonline/utils"
import { z } from "zod"

export const TaskTypeSchema = z.enum([
  "RESERVE_ATTENDEE",
  "CHARGE_ATTENDEE",
  "MERGE_ATTENDANCE_POOLS",
  "VERIFY_PAYMENT",
  "VERIFY_FEEDBACK_ANSWERED",
  "SEND_FEEDBACK_FORM_EMAILS",
  "VERIFY_ATTENDEE_ATTENDED",
])

export const TaskStatusSchema = z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELED"])

export const TaskSchema = z.object({
  id: z.string(),
  type: TaskTypeSchema,
  status: TaskStatusSchema.default("PENDING"),
  payload: buildLimitedDepthJsonSchema().default("{}"),
  createdAt: z.date(),
  scheduledAt: z.date(),
  processedAt: z.date().nullable(),
  recurringTaskId: z.string().nullable(),
})

export const RecurringTaskSchema = z.object({
  id: z.string(),
  type: TaskTypeSchema,
  payload: buildLimitedDepthJsonSchema().default("{}"),
  createdAt: z.date(),
  schedule: z.string(),
  lastRunAt: z.date().nullable(),
  nextRunAt: z.date(),
})

export type Task = z.infer<typeof TaskSchema>
export type TaskId = Task["id"]
export type TaskStatus = Task["status"]
export type TaskType = Task["type"]

export type RecurringTask = z.infer<typeof RecurringTaskSchema>
export type RecurringTaskId = RecurringTask["id"]

export const TaskWriteSchema = TaskSchema.pick({
  scheduledAt: true,
  processedAt: true,
  status: true,
  payload: true,
  recurringTaskId: true,
})

export type TaskWrite = z.infer<typeof TaskWriteSchema>

export const RecurringTaskWriteSchema = RecurringTaskSchema.pick({
  type: true,
  schedule: true,
  payload: true,
  lastRunAt: true,
}).partial({
  lastRunAt: true,
})

export type RecurringTaskWrite = z.infer<typeof RecurringTaskWriteSchema>
