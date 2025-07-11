import type { SchedulerClient } from "@aws-sdk/client-scheduler"
import type { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { TaskKind } from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { NotImplementedError } from "../../error"
import { getTaskDefinition } from "./task-definition"
import type { TaskRepository } from "./task-repository"
import type { TaskService } from "./task-service"

export interface TaskSchedulingService {
  /**
   * Schedule a task of a given kind with the expected payload for the task.
   */
  scheduleAt(handle: DBHandle, kind: TaskKind, data: JsonValue, executeAt: TZDate): Promise<void>
}

export function getLocalTaskSchedulingService(
  taskRepository: TaskRepository,
  taskService: TaskService
): TaskSchedulingService {
  const logger = getLogger("task-scheduling-service/local-backend")
  return {
    async scheduleAt(handle, kind, data, executeAt) {
      logger.info("Scheduling task of TaskKind=%s with data: %o", kind, data)
      const definition = getTaskDefinition(kind)
      const payload = taskService.parse(definition, data) as JsonValue
      await taskRepository.create(handle, kind, {
        payload,
        processedAt: null,
        scheduledAt: executeAt,
        status: "PENDING",
      })
    },
  }
}

export function getEventBridgeTaskSchedulingService(client: SchedulerClient): TaskSchedulingService {
  const logger = getLogger("task-scheduling-service/eventbridge-backend")
  return {
    // NOTE: The handle here is completely unused, but because the local backend needs to schedule within the caller
    // transaction, this one also needs to take a handle. Unfortunate but necessary.
    async scheduleAt(_, kind, data) {
      throw new NotImplementedError("EventBridgeSchedulingService#schedule")
    },
  }
}
