import type { DBHandle, TaskStatus } from "@dotkomonline/db"
import { type Task, type TaskId, TaskSchema, type TaskType, type TaskWrite } from "@dotkomonline/types"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { parseOrReport } from "../../invariant"

export interface TaskRepository {
  create(handle: DBHandle, type: TaskType, data: TaskWrite): Promise<Task>
  update(handle: DBHandle, taskId: TaskId, data: Partial<TaskWrite>, oldState?: TaskStatus): Promise<Task | null>
  delete(handle: DBHandle, taskId: TaskId): Promise<void>
  getById(handle: DBHandle, taskId: TaskId): Promise<Task | null>
  getAll(handle: DBHandle): Promise<Task[]>
  getPendingTasks(handle: DBHandle, type: TaskType): Promise<Task[]>
}

export function getTaskRepository(): TaskRepository {
  return {
    async create(handle, type, data) {
      const payload = data.payload ?? undefined
      const task = await handle.task.create({ data: { ...data, payload, type } })
      return parseOrReport(TaskSchema, task)
    },
    async update(handle, taskId, data, oldStatus) {
      try {
        console.log(`${taskId} fra ${oldStatus} til ${data.status}`)
        const task = await handle.task.update({
          where: { id: taskId, status: oldStatus ? { equals: oldStatus } : undefined },
          data: { ...data, payload: data.payload ?? undefined },
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
        where: { id: taskId },
      })
    },
    async getById(handle, taskId) {
      const task = await handle.task.findUnique({
        where: { id: taskId },
      })
      return task ? parseOrReport(TaskSchema, task) : null
    },
    async getAll(handle) {
      const tasks = await handle.task.findMany()
      return tasks.map((task) => parseOrReport(TaskSchema, task))
    },
    async getPendingTasks(handle, type) {
      const tasks = await handle.task.findMany({
        where: {
          scheduledAt: { lte: new Date() },
          status: "PENDING",
          type,
        },
      })
      return tasks.map((task) => parseOrReport(TaskSchema, task))
    },
  }
}
