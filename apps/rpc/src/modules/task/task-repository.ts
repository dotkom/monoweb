import type { DBHandle, TaskStatus } from "@dotkomonline/db"
import type { Task, TaskId, TaskKind, TaskWrite } from "@dotkomonline/types"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export interface TaskRepository {
  create(handle: DBHandle, kind: TaskKind, data: TaskWrite): Promise<Task>
  update(handle: DBHandle, taskId: TaskId, data: Partial<TaskWrite>, oldState?: TaskStatus): Promise<Task | null>
  delete(handle: DBHandle, taskId: TaskId): Promise<void>
  getById(handle: DBHandle, taskId: TaskId): Promise<Task | null>
  getAll(handle: DBHandle): Promise<Task[]>
  getPendingTasks(handle: DBHandle, kind: TaskKind): Promise<Task[]>
}

export function getTaskRepository(): TaskRepository {
  return {
    async create(handle, kind, data) {
      const payload = data.payload ?? undefined
      return await handle.task.create({ data: { ...data, payload, kind } })
    },
    async update(handle, taskId, data, oldStatus) {
      try {
        return await handle.task.update({
          where: { id: taskId, status: oldStatus ? { equals: oldStatus } : undefined },
          data: { ...data, payload: data.payload ?? undefined },
        })
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
      return await handle.task.findUnique({
        where: { id: taskId },
      })
    },
    async getAll(handle) {
      return await handle.task.findMany()
    },
    async getPendingTasks(handle, kind) {
      return await handle.task.findMany({
        where: {
          scheduledAt: { lte: new Date() },
          status: "PENDING",
          kind,
        },
      })
    },
  }
}
