import type { DBHandle } from "@dotkomonline/db"
import {
  type RecurringTask,
  type RecurringTaskId,
  RecurringTaskSchema,
  type RecurringTaskWrite,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface RecurringTaskRepository {
  create(handle: DBHandle, data: RecurringTaskWrite, nextRunAt: Date): Promise<RecurringTask>
  update(
    handle: DBHandle,
    recurringTaskId: RecurringTaskId,
    data: Partial<RecurringTaskWrite>,
    nextRunAt?: Date
  ): Promise<RecurringTask | null>
  delete(handle: DBHandle, recurringTaskId: RecurringTaskId): Promise<void>
  getById(handle: DBHandle, recurringTaskId: RecurringTaskId): Promise<RecurringTask | null>
  getAll(handle: DBHandle): Promise<RecurringTask[]>
  getPending(handle: DBHandle): Promise<RecurringTask[]>
}

export function getRecurringTaskRepository(): RecurringTaskRepository {
  return {
    async create(handle, data, nextRunAt) {
      const payload = data.payload ?? undefined
      const recurringTask = await handle.recurringTask.create({ data: { ...data, payload, nextRunAt } })
      return parseOrReport(RecurringTaskSchema, recurringTask)
    },
    async update(handle, recurringTaskId, data, nextRunAt) {
      const payload = data.payload ?? undefined
      const recurringTask = await handle.recurringTask.update({
        where: { id: recurringTaskId },
        data: { ...data, payload, nextRunAt },
      })
      return parseOrReport(RecurringTaskSchema, recurringTask)
    },
    async delete(handle, recurringTaskId) {
      await handle.recurringTask.delete({
        where: { id: recurringTaskId },
      })
    },
    async getById(handle, recurringTaskId) {
      const recurringTask = await handle.recurringTask.findUnique({
        where: { id: recurringTaskId },
      })
      return recurringTask ? parseOrReport(RecurringTaskSchema, recurringTask) : null
    },
    async getAll(handle) {
      const recurringTasks = await handle.recurringTask.findMany()
      return recurringTasks.map((recurringTask) => parseOrReport(RecurringTaskSchema, recurringTask))
    },
    async getPending(handle) {
      const recurringTasks = await handle.recurringTask.findMany({
        where: {
          nextRunAt: { lte: new Date() },
        },
      })
      return recurringTasks.map((recurringTask) => parseOrReport(RecurringTaskSchema, recurringTask))
    },
  }
}
