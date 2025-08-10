import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { UserSchema } from "./user"

// TODO: Where on earth does this come from?
export type AttendanceStatus = "NotOpened" | "Open" | "Closed"

export type AttendanceSelection = z.infer<typeof AttendanceSelectionSchema>
export const AttendanceSelectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export type AttendanceSelectionResponse = z.infer<typeof AttendanceSelectionResponseSchema>
export const AttendanceSelectionResponseSchema = z.object({
  selectionId: z.string(),
  selectionName: z.string(),
  optionId: z.string(),
  optionName: z.string(),
})

export type AttendanceSelectionResults = z.infer<typeof AttendanceSelectionResultSchema>
export const AttendanceSelectionResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** The number of attendees who have answered this selection. */
  count: z.number(),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      count: z.number(),
    })
  ),
})

export type AttendeeId = Attendee["id"]
export type Attendee = z.infer<typeof AttendeeSchema>
/**
 * Attendee is a user who has registered for an event, with their selections.
 *
 * The attendee's User object is included, but without memberships.
 */
export const AttendeeSchema = schemas.AttendeeSchema.extend({
  user: UserSchema,
  selections: z.array(AttendanceSelectionResponseSchema),
})

export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
export const AttendeeWriteSchema = AttendeeSchema.pick({
  attendedAt: true,
  earliestReservationAt: true,
  reserved: true,
  selections: true,
  /** The attending user's grade at time of registration. */
  userGrade: true,
})

export type AttendancePoolId = AttendancePool["id"]
export type AttendancePool = z.infer<typeof AttendancePoolSchema>
export const AttendancePoolSchema = schemas.AttendancePoolSchema.extend({
  yearCriteria: z.array(z.number()),
})

export type AttendancePoolWrite = z.infer<typeof AttendancePoolWriteSchema>
export const AttendancePoolWriteSchema = AttendancePoolSchema.pick({
  title: true,
  capacity: true,
  mergeDelayHours: true,
  yearCriteria: true,
})

/**
 * @packageDocumentation
 *
 * The attendance type itself, with both pool and selection joins ALWAYS present.
 */

export type Attendance = z.infer<typeof AttendanceSchema>
export type AttendanceId = Attendance["id"]
export const AttendanceSchema = schemas.AttendanceSchema.extend({
  pools: z.array(AttendancePoolSchema),
  attendees: z.array(AttendeeSchema),
  selections: z.array(AttendanceSelectionSchema),
})

export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export const AttendanceWriteSchema = AttendanceSchema.pick({
  registerStart: true,
  registerEnd: true,
  deregisterDeadline: true,
  selections: true,
})
