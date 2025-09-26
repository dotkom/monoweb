import type { SchedulerClient } from "@aws-sdk/client-scheduler"
import type { TZDate } from "@date-fns/tz"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type {
  AttendanceId,
  AttendancePoolId,
  AttendeeId,
  FeedbackFormId,
  RecurringTaskId,
  Task,
  TaskId,
} from "@dotkomonline/types"
import type { JsonValue } from "@prisma/client/runtime/library"
import { UnimplementedError } from "../../error"
import type { InferTaskData, TaskDefinition } from "./task-definition"
import type { TaskRepository } from "./task-repository"
import type { TaskService } from "./task-service"

export interface TaskSchedulingService {
  /**
   * Schedule a task of a given kind with the expected payload for the task.
   */
  // biome-ignore lint/suspicious/noExplicitAny: Any is used for type inference here
  scheduleAt<TTaskDef extends TaskDefinition<any, any>>(
    handle: DBHandle,
    kind: TTaskDef,
    data: InferTaskData<TTaskDef>,
    executeAt: TZDate,
    recurringTaskId?: RecurringTaskId
  ): Promise<TaskId>
  /**
   * Cancel a pending task.
   */
  cancel(handle: DBHandle, id: TaskId): Promise<void>

  findById(handle: DBHandle, id: TaskId): Promise<Task | null>
  findReserveAttendeeTask(handle: DBHandle, attendeeId: AttendeeId, attendanceId: AttendanceId): Promise<Task | null>
  findMergeEventPoolsTask(
    handle: DBHandle,
    attendanceId: AttendanceId,
    attendancePoolId: AttendancePoolId
  ): Promise<Task | null>
  findVerifyPaymentTask(handle: DBHandle, attendeeId: AttendeeId): Promise<Task | null>
  findChargeAttendeeTask(handle: DBHandle, attendeeId: AttendeeId): Promise<Task | null>
  findVerifyFeedbackAnsweredTask(handle: DBHandle, feedbackFormId: FeedbackFormId): Promise<Task | null>
}

export function getLocalTaskSchedulingService(
  taskRepository: TaskRepository,
  taskService: TaskService
): TaskSchedulingService {
  const logger = getLogger("task-scheduling-service/local-backend")
  return {
    async scheduleAt(handle, task, data, executeAt, recurringTaskId) {
      logger.info("Scheduling task of TaskKind=%s with data: %o", task, data)
      const payload = taskService.parse(task, data) as JsonValue
      const scheduledTask = await taskRepository.create(handle, task.type, {
        payload,
        processedAt: null,
        scheduledAt: executeAt,
        status: "PENDING",
        recurringTaskId: recurringTaskId ?? null,
      })
      return scheduledTask.id
    },
    async cancel(handle, id) {
      logger.info("Cancelling task with id: %s", id)
      const task = await taskRepository.getById(handle, id)
      if (task?.status !== "PENDING") {
        return
      }
      await taskRepository.update(handle, task.id, { status: "CANCELED" }, task.status)
    },
    async findById(handle, id) {
      return await taskRepository.getById(handle, id)
    },
    async findReserveAttendeeTask(handle, attendeeId, attendanceId) {
      return taskRepository.findReserveAttendeeTask(handle, attendeeId, attendanceId)
    },
    async findMergeEventPoolsTask(handle, attendanceId, attendancePoolId) {
      return taskRepository.findMergeEventPoolsTask(handle, attendanceId, attendancePoolId)
    },
    async findVerifyPaymentTask(handle, attendeeId) {
      return await taskRepository.findVerifyPaymentTask(handle, attendeeId)
    },
    async findChargeAttendeeTask(handle, attendeeId) {
      return await taskRepository.findChargeAttendeeTask(handle, attendeeId)
    },
    async findVerifyFeedbackAnsweredTask(handle, feedbackFormId) {
      return await taskRepository.findVerifyFeedbackAnsweredTask(handle, feedbackFormId)
    },
  }
}

export function getEventBridgeTaskSchedulingService(client: SchedulerClient): TaskSchedulingService {
  const logger = getLogger("task-scheduling-service/eventbridge-backend")
  return {
    // NOTE: The handle here is completely unused, but because the local backend needs to schedule within the caller
    // transaction, this one also needs to take a handle. Unfortunate but necessary.
    async scheduleAt(_, kind, data) {
      throw new UnimplementedError("EventBridgeSchedulingService#schedule")
    },
    async cancel(_, id) {
      throw new UnimplementedError("EventBridgeSchedulingService#cancel")
    },
    async findById(_, id) {
      logger.warn("findById is not implemented in EventBridgeSchedulingService")
      return null
    },
    async findReserveAttendeeTask(_, attendeeId, attendanceId) {
      logger.warn("findReserveAttendeeTask is not implemented in EventBridgeSchedulingService")
      return null
    },
    async findMergeEventPoolsTask(_, eventId) {
      logger.warn("findMergeEventPoolsTask is not implemented in EventBridgeSchedulingService")
      return null
    },
    async findVerifyPaymentTask(_, attendeeId) {
      logger.warn("findVerifyPaymentTask is not implemented in EventBridgeSchedulingService")
      return null
    },
    async findChargeAttendeeTask(_, attendeeId) {
      logger.warn("findChargeAttendancePaymentsTask is not implemented in EventBridgeSchedulingService")
      return null
    },
    async findVerifyFeedbackAnsweredTask(_, feedbackFormId) {
      logger.warn("findVerifyFeedbackAnsweredTask is not implemented in EventBridgeSchedulingService")
      return null
    },
  }
}
