import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  AttendeeSelectionResponsesSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  getAttendee: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendeeService.getByUserId(input.userId, input.attendanceId)),
  createPool: protectedProcedure
    .input(AttendancePoolWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.attendanceService.createPool(input)),

  updatePool: protectedProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
        input: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: { id, input }, ctx }) => ctx.attendanceService.updatePool(id, input)),

  deletePool: protectedProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.deletePool(input.id)),

  registerForEvent: protectedProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        attendancePoolId: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.attendeeService.registerForEvent(input.userId, input.attendancePoolId, new Date())
    ),

  deregisterForEvent: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendeeService.deregisterForEvent(input.id, new Date())),

  adminDeregisterForEvent: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendeeService.adminDeregisterForEvent(input.id, new Date())),

  getSelectionsResults: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getSelectionResults(input.attendanceId)),

  registerAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        attended: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.attendeeService.updateAttended(input.attended, input.id)),
  handleQrCodeRegistration: protectedProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(
      async ({ input, ctx }) => await ctx.attendeeService.handleQrCodeRegistration(input.userId, input.attendanceId)
    ),

  updateSelectionResponses: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        options: AttendeeSelectionResponsesSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.attendeeService.updateSelectionResponses(input.id, input.options)),

  getAttendees: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendeeService.getByAttendanceId(input.id)),

  getAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getById(input.id)),
  updateAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        attendance: AttendanceWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.update(input.id, input.attendance)),
  mergeAttendancePools: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        yearCriteria: z.array(z.number()),
        title: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.attendanceService.merge(input.attendanceId, input.title, input.yearCriteria)
    ),

  getWaitlist: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.waitlistAttendeService.getByAttendanceId(input.id)),

  getSelectionResponseResults: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getSelectionResults(input.attendanceId)),
})
