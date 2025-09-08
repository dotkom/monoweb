import type { TaskId, TaskType } from "@dotkomonline/types"
import type { z } from "zod"
import { ApplicationError, IllegalStateError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class InvalidTaskKind extends IllegalStateError {
  constructor(taskKind: TaskType, taskId: TaskId) {
    super(`Invalid task kind: ${taskKind} seen in TaskID=${taskId}. This is a severe bug in the application.`)
  }
}

export class TaskNotFound extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Task with id ${id} not found`)
  }
}

export class TaskDataValidationError extends IllegalStateError {
  constructor(kind: TaskType, error: z.ZodError) {
    super(`Task validation for TaskKind=${kind} failed with error: ${error.message}`)
  }
}

export class TaskDefinitionNotFoundError extends IllegalStateError {
  constructor(kind: TaskType) {
    super(`Task definition for TaskKind=${kind} not found`)
  }
}

export class InvalidCronExpressionError extends IllegalStateError {
  constructor(expression: string) {
    super(`Cron expression ${expression} is invalid`)
  }
}

export class RecurringTaskNotFoundError extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `RecurringTask with id ${id} not found`)
  }
}
