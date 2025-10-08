import { AttendanceSchema, AttendeeSchema, FeedbackFormSchema, type TaskType } from "@dotkomonline/types"
import { z } from "zod"
import { NotFoundError } from "../../error"

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

export type ReserveAttendeeTaskDefinition = typeof tasks.RESERVE_ATTENDEE
export type MergeAttendancePoolsTaskDefinition = typeof tasks.MERGE_ATTENDANCE_POOLS
export type VerifyPaymentTaskDefinition = typeof tasks.VERIFY_PAYMENT
export type ChargeAttendeeTaskDefinition = typeof tasks.CHARGE_ATTENDEE
export type VerifyFeedbackAnsweredTaskDefinition = typeof tasks.VERIFY_FEEDBACK_ANSWERED
export type SendFeedbackFormEmailsTaskDefinition = typeof tasks.SEND_FEEDBACK_FORM_EMAILS
export type VerifyAttendeeAttendedTaskDefinition = typeof tasks.VERIFY_ATTENDEE_ATTENDED
export type AnyTaskDefinition =
  | ReserveAttendeeTaskDefinition
  | MergeAttendancePoolsTaskDefinition
  | VerifyPaymentTaskDefinition
  | ChargeAttendeeTaskDefinition
  | VerifyFeedbackAnsweredTaskDefinition
  | SendFeedbackFormEmailsTaskDefinition
  | VerifyAttendeeAttendedTaskDefinition

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
      }),
  }),
  VERIFY_PAYMENT: createTaskDefinition({
    type: "VERIFY_PAYMENT",
    getSchema: () =>
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      }),
  }),
  CHARGE_ATTENDEE: createTaskDefinition({
    type: "CHARGE_ATTENDEE",
    getSchema: () =>
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      }),
  }),
  VERIFY_FEEDBACK_ANSWERED: createTaskDefinition({
    type: "VERIFY_FEEDBACK_ANSWERED",
    getSchema: () =>
      z.object({
        feedbackFormId: FeedbackFormSchema.shape.id,
      }),
  }),
  SEND_FEEDBACK_FORM_EMAILS: createTaskDefinition({
    type: "SEND_FEEDBACK_FORM_EMAILS",
    getSchema: () => z.object({}),
  }),
  VERIFY_ATTENDEE_ATTENDED: createTaskDefinition({
    type: "VERIFY_ATTENDEE_ATTENDED",
    getSchema: () => z.object({}),
  }),
  // biome-ignore lint/suspicious/noExplicitAny: used for type inference only
} satisfies Record<TaskType, TaskDefinition<any, any>>

export function getTaskDefinition<TType extends TaskType>(type: TType): TaskDefinition<unknown, TType> {
  const task = Object.values(tasks).find((task) => task.type === type)
  if (task === undefined) {
    throw new NotFoundError(`TaskDefinition(Type=${type}) not found`)
  }
  return task as TaskDefinition<unknown, TType>
}
