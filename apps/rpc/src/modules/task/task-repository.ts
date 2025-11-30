import type { DBHandle, TaskStatus } from "@dotkomonline/db"
import {
  type AttendanceId,
  type AttendeeId,
  type FeedbackFormId,
  type Task,
  type TaskId,
  TaskSchema,
  type TaskType,
  type TaskWrite,
} from "@dotkomonline/types"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { parseOrReport } from "../../invariant"
import { tasks } from "./task-definition"

export interface TaskRepository {
  create(handle: DBHandle, type: TaskType, data: TaskWrite): Promise<Task>
  update(handle: DBHandle, taskId: TaskId, data: Partial<TaskWrite>, oldState?: TaskStatus): Promise<Task | null>
  delete(handle: DBHandle, taskId: TaskId): Promise<void>
  findById(handle: DBHandle, taskId: TaskId): Promise<Task | null>
  findMany(handle: DBHandle): Promise<Task[]>
  findPendingTasks(handle: DBHandle, type: TaskType): Promise<Task[]>

  findReserveAttendeeTask(handle: DBHandle, attendeeId: AttendeeId, attendanceId: AttendanceId): Promise<Task | null>
  findVerifyPaymentTask(handle: DBHandle, attendeeId: AttendeeId): Promise<Task | null>
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

    async update(handle, taskId, data, oldStatus) {
      try {
        const task = await handle.task.update({
          where: {
            id: taskId,
            status: oldStatus ? { equals: oldStatus } : undefined,
          },
          data: {
            ...data,
            payload: data.payload ?? undefined,
          },
        })

        return parseOrReport(TaskSchema, task)
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
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

    async findPendingTasks(handle, type) {
      const tasks = await handle.task.findMany({
        where: {
          scheduledAt: { lte: new Date() },
          status: "PENDING",
          type,
        },
      })

      return parseOrReport(TaskSchema.array(), tasks)
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
    async findVerifyPaymentTask(handle, attendeeId) {
      const task = await handle.task.findFirst({
        where: {
          type: tasks.VERIFY_PAYMENT.type,
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
