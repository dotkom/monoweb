import type { DBHandle, TaskStatus } from "@dotkomonline/db"
import { Prisma } from "@dotkomonline/db"
import type { AttendanceId, AttendeeId } from "../event/attendance"
import type { FeedbackFormId } from "../feedback-form/feedback-form"
import {
  type ClaimedTask,
  ClaimedTaskSchema,
  TaskTypeSchema,
  type Task,
  type TaskId,
  TaskSchema,
  type TaskType,
  type TaskWrite,
} from "./task"
import { parseOrReport } from "../../invariant"
import { tasks } from "./task-definition"

export interface TaskRepository {
  create(handle: DBHandle, type: TaskType, data: TaskWrite): Promise<Task>
  update(
    handle: DBHandle,
    taskId: TaskId,
    data: Partial<TaskWrite>,
    oldState?: TaskStatus,
    processedAt?: Date | null
  ): Promise<Task | null>
  delete(handle: DBHandle, taskId: TaskId): Promise<void>
  findById(handle: DBHandle, taskId: TaskId): Promise<Task | null>
  findMany(handle: DBHandle): Promise<Task[]>
  claimNextTask(handle: DBHandle, claimedAt: Date, checkoutLeaseExpiredBefore: Date): Promise<ClaimedTask | null>

  findReserveAttendeeTask(handle: DBHandle, attendeeId: AttendeeId, attendanceId: AttendanceId): Promise<Task | null>
  findVerifyAttendanceCompletionTask(handle: DBHandle, attendeeId: AttendeeId): Promise<Task | null>
  findChargeAttendeeTask(handle: DBHandle, attendeeId: AttendeeId): Promise<Task | null>
  findVerifyFeedbackAnsweredTask(handle: DBHandle, feedbackFormId: FeedbackFormId): Promise<Task | null>
}

export function getTaskRepository(): TaskRepository {
  return {
    async create(handle, type, data) {
      const payload = data.payload ?? undefined
      const task = await handle.task.create({
        data: {
          ...data,
          payload,
          type,
        },
      })

      return parseOrReport(TaskSchema, task)
    },

    async update(handle, taskId, data, oldStatus, processedAt) {
      try {
        const task = await handle.task.update({
          where: {
            id: taskId,
            status: oldStatus,
            processedAt,
          },
          data: {
            ...data,
            payload: data.payload ?? undefined,
          },
        })

        return parseOrReport(TaskSchema, task)
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          // "An operation failed because it depends on one or more records that were required but not found. {cause}"
          if (e.code === "P2025") {
            return null
          }
        }
        throw e
      }
    },

    async delete(handle, taskId) {
      await handle.task.delete({
        where: {
          id: taskId,
        },
      })
    },

    async findById(handle, taskId) {
      const task = await handle.task.findUnique({
        where: {
          id: taskId,
        },
      })

      return parseOrReport(TaskSchema.nullable(), task)
    },

    async findMany(handle) {
      const tasks = await handle.task.findMany()

      return parseOrReport(TaskSchema.array(), tasks)
    },

    async claimNextTask(handle, claimedAt, checkoutLeaseExpiredBefore) {
      const supportedTypes = TaskTypeSchema.options.map((type) => Prisma.sql`${type}::task_type`)
      const [task] = await handle.$queryRaw<unknown[]>`
        WITH next_task AS (
          SELECT id FROM task
          WHERE type IN (${Prisma.join(supportedTypes)})
            AND (
              (status = 'PENDING' AND scheduled_at <= ${claimedAt})
              OR (type = 'OPEN_PAYMENT_CHECKOUT' AND status = 'RUNNING' AND processed_at <= ${checkoutLeaseExpiredBefore})
            )
          ORDER BY scheduled_at, id
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        UPDATE task SET status = 'RUNNING', processed_at = ${claimedAt}
        FROM next_task WHERE task.id = next_task.id
        RETURNING task.id, task.type, task.status, task.payload, task.created_at AS "createdAt",
          task.scheduled_at AS "scheduledAt", task.processed_at AS "processedAt", task.recurring_task_id AS "recurringTaskId"
      `

      return parseOrReport(ClaimedTaskSchema.nullable(), task ?? null)
    },

    // TODO: replace the find methods with getall
    async findReserveAttendeeTask(handle, attendeeId, attendanceId) {
      const task = await handle.task.findFirst({
        where: {
          type: tasks.RESERVE_ATTENDEE.type,
          AND: [
            {
              payload: {
                path: ["attendeeId"],
                equals: attendeeId,
              },
            },
            {
              payload: {
                path: ["attendanceId"],
                equals: attendanceId,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return parseOrReport(TaskSchema.nullable(), task)
    },
    async findVerifyAttendanceCompletionTask(handle, attendeeId) {
      const task = await handle.task.findFirst({
        where: {
          type: tasks.VERIFY_ATTENDANCE_COMPLETION.type,
          payload: {
            path: ["attendeeId"],
            equals: attendeeId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return parseOrReport(TaskSchema.nullable(), task)
    },

    async findChargeAttendeeTask(handle, attendeeId) {
      const task = await handle.task.findFirst({
        where: {
          type: tasks.CHARGE_ATTENDEE.type,
          payload: {
            path: ["attendeeId"],
            equals: attendeeId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return parseOrReport(TaskSchema.nullable(), task)
    },

    async findVerifyFeedbackAnsweredTask(handle, feedbackFormId) {
      const task = await handle.task.findFirst({
        where: {
          type: tasks.VERIFY_FEEDBACK_ANSWERED.type,
          payload: {
            path: ["feedbackFormId"],
            equals: feedbackFormId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return parseOrReport(TaskSchema.nullable(), task)
    },
  }
}
