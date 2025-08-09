import {
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendeeSchema,
  type TaskType,
  UserSchema,
} from "@dotkomonline/types"
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

export type AttemptReserveAttendeeTaskDefinition = typeof tasks.ATTEMPT_RESERVE_ATTENDEE
export type MergePoolsTaskDefinition = typeof tasks.MERGE_POOLS
export type VerifyPaymentTaskDefinition = typeof tasks.VERIFY_PAYMENT
export type ChargeAttendancePaymentsTaskDefinition = typeof tasks.CHARGE_ATTENDANCE_PAYMENTS
export type AnyTaskDefinition = AttemptReserveAttendeeTaskDefinition | MergePoolsTaskDefinition

export const tasks = {
  ATTEMPT_RESERVE_ATTENDEE: createTaskDefinition({
    type: "ATTEMPT_RESERVE_ATTENDEE",
    getSchema: () =>
      z.object({
        userId: UserSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      }),
  }),
  MERGE_POOLS: createTaskDefinition({
    type: "MERGE_POOLS",
    getSchema: () =>
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        newMergePoolData: AttendancePoolWriteSchema.partial(),
      }),
  }),
  VERIFY_PAYMENT: createTaskDefinition({
    type: "VERIFY_PAYMENT",
    getSchema: () =>
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      }),
  }),
  CHARGE_ATTENDANCE_PAYMENTS: createTaskDefinition({
    type: "CHARGE_ATTENDANCE_PAYMENTS",
    getSchema: () =>
      z.object({
        attendanceId: z.string(),
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
