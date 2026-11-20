import type { DBClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { ClaimedTask, RecurringTask, TaskType } from "./task"
import type { RecurringTaskService } from "./recurring-task-service"
import type { TaskService } from "./task-service"

export interface TaskDiscoveryService {
  claimNextTask(taskTypes: readonly TaskType[]): Promise<ClaimedTask | null>
  querySchedulableRecurringTasks(): Promise<RecurringTask[]>
}

/**
 * Create a TaskDiscoveryService that discovers tasks from the local database.
 *
 * NOTE: This constructor takes the DBClient as an argument (as opposed to a DBHandle) as the task discovery service
 * runs independently of any request or other transaction context.
 */
export function getLocalTaskDiscoveryService(
  client: DBClient,
  taskService: TaskService,
  recurringTaskService: RecurringTaskService
): TaskDiscoveryService {
  const logger = getLogger("task-discovery-service/local-backend")
  logger.warn("TaskDiscoveryService started with local (postgres) backend")

  return {
    async claimNextTask(taskTypes) {
      return taskService.claimNextTask(client, taskTypes)
    },

    async querySchedulableRecurringTasks() {
      return await recurringTaskService.findSchedulableTasks(client)
    },
  }
}
