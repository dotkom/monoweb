import type { DBHandle, Prisma } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { getCurrentUTC } from "@dotkomonline/utils"
import { addMinutes, subMinutes } from "date-fns"
import type { ClaimedTask, Task, TaskId, TaskWrite } from "./task"
import { InvalidArgumentError } from "../../error"
import type { InferTaskData, TaskDefinition } from "./task-definition"
import type { TaskRepository } from "./task-repository"

const CHECKOUT_LEASE_MINUTES = 5

export type TaskOutcome = "COMPLETED" | "SKIPPED" | "FAILED" | "PENDING"

export type TaskService = {
  finishTask(handle: DBHandle, task: ClaimedTask, status: TaskOutcome): Promise<void>
  findById(handle: DBHandle, taskId: TaskId): Promise<Task | null>
  claimNextTask(handle: DBHandle): Promise<ClaimedTask | null>

  /**
   * Parse and validate the payload for a given task, given its specification.
   *
   * @throws {InvalidArgumentError} If the payload does not match the expected schema for the task kind
   */
  // biome-ignore lint/suspicious/noExplicitAny: these are used in inference position
  parse<const TTaskDef extends TaskDefinition<any, any>>(
    taskDefinition: TTaskDef,
    payload: Prisma.JsonValue
  ): InferTaskData<TTaskDef>
}

export function getTaskService(taskRepository: TaskRepository): TaskService {
  const logger = getLogger("task-service")

  return {
    async finishTask(handle, task, status) {
      const now = getCurrentUTC()
      const update: Partial<TaskWrite> = { status, processedAt: now }

      if (status === "PENDING") {
        update.processedAt = null
        update.scheduledAt = addMinutes(now, 1)
      }

      // A worker can only finish its own claim, including after another worker reclaimed an abandoned checkout.
      await taskRepository.update(handle, task.id, update, "RUNNING", task.processedAt)
    },

    async findById(handle, taskId) {
      return await taskRepository.findById(handle, taskId)
    },

    async claimNextTask(handle) {
      const claimedAt = getCurrentUTC()
      const checkoutLeaseExpiredBefore = subMinutes(claimedAt, CHECKOUT_LEASE_MINUTES)

      return await taskRepository.claimNextTask(handle, claimedAt, checkoutLeaseExpiredBefore)
    },

    parse(taskDefinition, payload) {
      const schema = taskDefinition.getSchema()
      const result = schema.safeParse(payload)

      if (!result.success) {
        logger.error("Failed to parse task payload for Task(Type=%s): %o", taskDefinition.type, result.error)
        // NOTE: We deliberately DO NOT include the actual parsing error in the thrown error, as it may contain private
        // or sensitive information depending on the task kind.
        throw new InvalidArgumentError(`Invalid payload for Task(Type=${taskDefinition.type})`)
      }

      return result.data
    },
  }
}
