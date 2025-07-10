import { schemas } from "@dotkomonline/db/schemas"
import type { z } from "zod"

export const TaskSchema = schemas.TaskSchema.extend({})

export type Task = z.infer<typeof TaskSchema>
export type TaskId = Task["id"]
export type TaskStatus = Task["status"]
export type TaskKind = Task["kind"]
export type TaskScheduledAt = Task["scheduledAt"]

export const TaskWriteSchema = TaskSchema.pick({
  scheduledAt: true,
  processedAt: true,
  status: true,
  payload: true,
})

export type TaskWrite = z.infer<typeof TaskWriteSchema>
