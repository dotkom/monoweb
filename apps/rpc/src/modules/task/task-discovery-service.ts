import type { SQSClient } from "@aws-sdk/client-sqs"
import type { DBClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { RecurringTask, Task } from "@dotkomonline/types"
import { UnimplementedError } from "../../error"
import type { RecurringTaskService } from "./recurring-task-service"
import type { TaskService } from "./task-service"

export interface TaskDiscoveryService {
  queryNextTask(): Promise<Task | null>
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
    async queryNextTask() {
      return taskService.findNextPendingTask(client)
    },

    async querySchedulableRecurringTasks() {
      return await recurringTaskService.findSchedulableTasks(client)
    },
  }
}

/**
 * An SQS-backed TaskDiscoveryService that polls multiple SQS queues for tasks to execute. The tasks used in the queues
 * on SQS are scheduled by AWS EventBridge.
 */
export function getSQSTaskDiscoveryService(_client: SQSClient): TaskDiscoveryService {
  const logger = getLogger("task-discovery-service/sqs-backend")
  return {
    async queryNextTask() {
      logger.warn("queryNextTask is not implemented for SQS TaskDiscoveryService")
      throw new UnimplementedError("SQSTaskDiscovery#queryNextTask")
    },

    async querySchedulableRecurringTasks() {
      logger.warn("querySchedulableRecurringTasks is not implemented for SQS TaskDiscoveryService")
      throw new UnimplementedError("SQSTaskDiscovery#querySchedulableRecurringTasks")
    },
  }
}
