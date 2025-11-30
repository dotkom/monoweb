import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Task, TaskId, TaskStatus, TaskType, TaskWrite } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { IllegalStateError, InvalidArgumentError, NotFoundError } from "../../error"
import { type InferTaskData, type TaskDefinition, getTaskDefinition } from "./task-definition"
import type { TaskRepository } from "./task-repository"

export type TaskService = {
  /**
   * Updates a task
   *
   * @throws {NotFoundError} if the task with the given `taskId` does not exist
   */
  update(handle: DBHandle, taskId: TaskId, data: Partial<TaskWrite>, oldState: TaskStatus): Promise<Task>
  setTaskExecutionStatus(handle: DBHandle, taskId: TaskId, status: TaskStatus, oldStatus: TaskStatus): Promise<Task>
  findById(handle: DBHandle, taskId: TaskId): Promise<Task | null>
  findPendingTasks(handle: DBHandle, kind: TaskType): Promise<Task[]>

  /**
   * Parse and validate the payload for a given task, given its specification.
   *
   * @throws {InvalidArgumentError} If the payload does not match the expected schema for the task kind
   */
  // biome-ignore lint/suspicious/noExplicitAny: these are used in inference position
  parse<const TTaskDef extends TaskDefinition<any, any>>(
    taskDefinition: TTaskDef,
    payload: JsonValue
  ): InferTaskData<TTaskDef>
}

export function getTaskService(taskRepository: TaskRepository): TaskService {
  const logger = getLogger("task-service")

  return {
    async update(handle, taskId, data, oldState) {
      const requestedTask = await taskRepository.findById(handle, taskId)

      if (!requestedTask) {
        throw new NotFoundError(`Task(ID=${taskId}) not found`)
      }

      // If the caller wants to update the task data, we must validate it against the task kind.
      let newPayload = requestedTask.payload
      if (data.payload) {
        const definition = getTaskDefinition(requestedTask.type)
        newPayload = this.parse(definition, data.payload) as JsonValue
      }

      // Update the task with the new data and the updated and validated payload.
      const task = await taskRepository.update(
        handle,
        taskId,
        {
          ...data,
          payload: newPayload,
        },
        oldState
      )

      // If the task was not found, there is a critical system bug because this entire thing is ran inside a database
      // transaction. This is merely a sanity check.
      if (task === null) {
        logger.error("Task(ID=%s) disappeared in between getById and update", taskId)
        throw new IllegalStateError(taskId)
      }

      return task
    },

    async setTaskExecutionStatus(handle, taskId, status, oldStatus) {
      return await this.update(handle, taskId, { processedAt: new Date(), status }, oldStatus)
    },

    async findById(handle, taskId) {
      return await taskRepository.findById(handle, taskId)
    },

    async findPendingTasks(handle, kind) {
      return await taskRepository.findPendingTasks(handle, kind)
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
