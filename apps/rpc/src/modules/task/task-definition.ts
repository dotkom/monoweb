import { AttendancePoolWriteSchema, AttendanceSchema, AttendeeSchema, type TaskType } from "@dotkomonline/types"
import { z } from "zod"
import { TaskDefinitionNotFoundError } from "./task-error"

export interface TaskDefinition<TData, TType extends TaskType> {
  getSchema(): z.ZodSchema<TData>
  type: TType
}

export type InferTaskData<TDef> = TDef extends TaskDefinition<infer TData, infer TType> ? TData : never
export type InferTaskType<TDef> = TDef extends TaskDefinition<infer TData, infer TType extends TaskType> ? TType : never

export function createTaskDefinition<const TData, const TType extends TaskType>(
  definition: TaskDefinition<TData, TType>
): TaskDefinition<TData, TType> {
  return definition
}

export type ReserveAttendeeTaskDef = typeof tasks.RESERVE_ATTENDEE
export type MergeAttendancePoolsTaskDef = typeof tasks.MERGE_ATTENDANCE_POOLS
export type AnyTaskDefinition = ReserveAttendeeTaskDef | MergeAttendancePoolsTaskDef

export const tasks = {
  RESERVE_ATTENDEE: createTaskDefinition({
    type: "RESERVE_ATTENDEE",
    getSchema: () =>
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      }),
  }),
  MERGE_ATTENDANCE_POOLS: createTaskDefinition({
    type: "MERGE_ATTENDANCE_POOLS",
    getSchema: () =>
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        newMergePoolData: AttendancePoolWriteSchema.partial(),
      }),
  }),
}

export function getTaskDefinition<TType extends TaskType>(type: TType): TaskDefinition<unknown, TType> {
  const task = Object.values(tasks).find((task) => task.type === type)
  if (task === undefined) {
    throw new TaskDefinitionNotFoundError(type)
  }
  return task as TaskDefinition<unknown, TType>
}
