import { schemas } from "@dotkomonline/db/schemas"
import type { z } from "zod"

export const JobSchema = schemas.JobSchema.extend({})

export type Job = z.infer<typeof JobSchema>
export type JobId = Job["id"]
export type JobStatus = Job["status"]
export type JobName = Job["name"]
export type JobScheduledAt = Job["scheduledAt"]

export const JobWriteSchema = JobSchema.omit({
  id: true,
  createdAt: true,
}).partial({
  processedAt: true,
  status: true,
  payload: true,
})

export type JobWrite = z.infer<typeof JobWriteSchema>
