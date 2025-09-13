import type { DBHandle } from "@dotkomonline/db"
import type { RecurringTask, RecurringTaskId, RecurringTaskWrite } from "@dotkomonline/types"
import { getCurrentUTC } from "@dotkomonline/utils"
import { CronExpressionParser } from "cron-parser"
import type { RecurringTaskRepository } from "./recurring-task-repository"
import { InvalidCronExpressionError, RecurringTaskNotFoundError } from "./task-error"

export type RecurringTaskService = {
  create(handle: DBHandle, data: RecurringTaskWrite, nextRunAt?: Date): Promise<RecurringTask>
  update(
    handle: DBHandle,
    recurringTaskId: RecurringTaskId,
    data: Partial<RecurringTaskWrite>,
    nextRunAt?: Date
  ): Promise<RecurringTask | null>
  delete(handle: DBHandle, recurringTaskId: RecurringTaskId): Promise<void>
  getById(handle: DBHandle, recurringTaskId: RecurringTaskId): Promise<RecurringTask>
  getAll(handle: DBHandle): Promise<RecurringTask[]>
  getPending(handle: DBHandle): Promise<RecurringTask[]>
  scheduleNextRun(handle: DBHandle, recurringTaskid: RecurringTaskId, lastRunAt: Date): Promise<void>
}

export function getRecurringTaskService(recurringTaskRepository: RecurringTaskRepository): RecurringTaskService {
  return {
    async create(handle, data, nextRunAt) {
      if (!validateCron(data.schedule)) {
        throw new InvalidCronExpressionError(data.schedule)
      }

      const computedNextRunAt = nextRunAt ?? createNextRunAt(data.schedule)

      return await recurringTaskRepository.create(handle, data, computedNextRunAt)
    },
    async update(handle, recurringTaskId, data, nextRunAt) {
      if (data.schedule && !validateCron(data.schedule)) {
        throw new InvalidCronExpressionError(data.schedule)
      }

      return await recurringTaskRepository.update(handle, recurringTaskId, data, nextRunAt)
    },
    async delete(handle, recurringTaskId) {
      return await recurringTaskRepository.delete(handle, recurringTaskId)
    },
    async getById(handle, recurringTaskId) {
      const recurringTask = await recurringTaskRepository.getById(handle, recurringTaskId)
      if (!recurringTask) {
        throw new RecurringTaskNotFoundError(recurringTaskId)
      }

      return recurringTask
    },
    async getAll(handle) {
      return await recurringTaskRepository.getAll(handle)
    },
    async getPending(handle) {
      return await recurringTaskRepository.getPending(handle)
    },
    async scheduleNextRun(handle, recurringTaskId, lastRunAt) {
      const recurringTask = await this.getById(handle, recurringTaskId)

      const nextRunAt = createNextRunAt(recurringTask.schedule)

      await this.update(
        handle,
        recurringTaskId,
        {
          lastRunAt,
        },
        nextRunAt
      )
    },
  }
}

function validateCron(expression: string): boolean {
  try {
    CronExpressionParser.parse(expression)
    return true
  } catch {
    return false
  }
}

function createNextRunAt(expression: string): Date {
  const interval = CronExpressionParser.parse(expression, {
    currentDate: getCurrentUTC(),
    tz: "UTC",
  })

  return interval.next().toDate()
}
