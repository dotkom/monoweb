import { AttendancePoolWriteSchema, type TaskKind } from "@dotkomonline/types"
import { AttendanceSchema, Auth0UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { TaskDefinitionNotFoundError } from "./task-error"

export interface TaskDefinition<TData, TKind extends TaskKind> {
  getSchema(): z.ZodSchema<TData>
  kind: TKind
}

export type InferTaskData<TDef> = TDef extends TaskDefinition<infer TData, infer TKind> ? TData : never
export type InferTaskKind<TDef> = TDef extends TaskDefinition<infer TData, infer TKind extends TaskKind> ? TKind : never

export function createTaskDefinition<const TData, const TKind extends TaskKind>(
  definition: TaskDefinition<TData, TKind>
): TaskDefinition<TData, TKind> {
  return definition
}

export type AttemptReserveAttendeeTaskDefinition = typeof tasks.ATTEMPT_RESERVE_ATTENDEE
export type MergePoolsTaskDefinition = typeof tasks.MERGE_POOLS
export type AnyTaskDefinition = AttemptReserveAttendeeTaskDefinition | MergePoolsTaskDefinition

export const tasks = {
  ATTEMPT_RESERVE_ATTENDEE: createTaskDefinition({
    kind: "ATTEMPT_RESERVE_ATTENDEE",
    getSchema: () =>
      z.object({
        userId: Auth0UserSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      }),
  }),
  MERGE_POOLS: createTaskDefinition({
    kind: "MERGE_POOLS",
    getSchema: () =>
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        newMergePoolData: AttendancePoolWriteSchema.partial(),
      }),
  }),
}

export function getTaskDefinition<TKind extends TaskKind>(kind: TKind): TaskDefinition<unknown, TKind> {
  const task = Object.values(tasks).find((task) => task.kind === kind)
  if (task === undefined) {
    throw new TaskDefinitionNotFoundError(kind)
  }
  return task as TaskDefinition<unknown, TKind>
}
