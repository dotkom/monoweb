import type { SQSClient } from "@aws-sdk/client-sqs"
import type { DBClient } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Task, TaskType } from "@dotkomonline/types"
import { NotImplementedError } from "../../error"
import { tasks } from "./task-definition"
import type { TaskService } from "./task-service"

export interface TaskDiscoveryService {
  discover(kind: TaskType): Promise<Task[]>
  discoverAll(): Promise<Task[]>
}

/**
 * Create a TaskDiscoveryService that discovers tasks from the local database.
 *
 * NOTE: This constructor takes the DBClient as an argument (as opposed to a DBHandle) as the task discovery service
 * runs independently of any request or other transaction context.
 */
export function getLocalTaskDiscoveryService(client: DBClient, taskService: TaskService): TaskDiscoveryService {
  const logger = getLogger("task-discovery-service/local-backend")
  return {
    async discoverAll() {
      const discoveredTasks = await Promise.all([
        this.discover(tasks.RESERVE_ATTENDEE.type),
        this.discover(tasks.MERGE_ATTENDANCE_POOLS.type),
        this.discover(tasks.VERIFY_PAYMENT.type),
        this.discover(tasks.CHARGE_ATTENDEE.type),
        this.discover(tasks.VERIFY_FEEDBACK_ANSWERED.type),
      ])
      return discoveredTasks.flat()
    },
    async discover(kind) {
      logger.debug("Running task discovery for Kind=%s", kind)
      const jobs = await taskService.getPendingTasks(client, kind)

      if (jobs.length > 0) {
        logger.info("Task discovery for Kind=%s yielded %d tasks", kind, jobs.length)
      } else {
        logger.debug("Task discovery for Kind=%s yielded no tasks", kind)
      }

      return jobs
    },
  }
}

/**
 * An SQS-backed TaskDiscoveryService that polls multiple SQS queues for tasks to execute. The tasks used in the queues
 * on SQS are scheduled by AWS EventBridge.
 */
export function getSQSTaskDiscoveryService(client: SQSClient): TaskDiscoveryService {
  const logger = getLogger("task-discovery-service/sqs-backend")
  return {
    async discoverAll() {
      logger.warn("discoverAll is not implemented for SQS TaskDiscoveryService")
      throw new NotImplementedError("SQSTaskDiscovery#discoverAll")
    },
    async discover(kind) {
      logger.warn("discover is not implemented for SQS TaskDiscoveryService")
      throw new NotImplementedError("SQSTaskDiscovery#discover")
    },
  }
}
