import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  EventSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  isAttending: protectedProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.attendance.isAttending(input.userId, input.attendanceId)),
  createPool: protectedProcedure
    .input(AttendancePoolWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.attendanceService.pool.create(input)),

  updatePool: protectedProcedure
    .input(
      z.object({
        input: AttendancePoolWriteSchema.partial(),
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.pool.update(input.input, input.id)),

  deletePool: protectedProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.pool.delete(input.id)),

  registerForEvent: protectedProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.attendanceService.attendee.registerForEvent(input.userId, input.attendanceId)
    ),

  deregisterForEvent: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.attendee.deregisterForEvent(input.id)),

  registerAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        attended: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.attendanceService.attendee.updateAttended(input.attended, input.id)),

  addExtraChoice: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        questionId: z.string(),
        choiceId: z.string(),
      })
    )
    .mutation(
      async ({ input, ctx }) =>
        await ctx.attendanceService.attendee.updateExtraChoices(input.id, input.questionId, input.choiceId)
    ),

  getPoolsByAttendanceId: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.pool.getByAttendanceId(input.id)),

  getAttendees: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.attendee.getByAttendanceId(input.id)),

  getAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.attendance.getById(input.id)),
  updateAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        attendance: AttendanceWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.attendance.update(input.attendance, input.id)),
})
