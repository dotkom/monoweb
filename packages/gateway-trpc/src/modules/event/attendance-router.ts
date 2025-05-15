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
import { adminProcedure, protectedProcedure, publicProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  getAttendee: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendeeService.getByUserId(input.userId, input.attendanceId)),
  createPool: adminProcedure
    .input(AttendancePoolWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.attendanceService.createPool(input)),

  updatePool: adminProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
        input: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: { id, input }, ctx }) => ctx.attendanceService.updatePool(id, input)),

  deletePool: adminProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.deletePool(input.id)),

  adminRegisterForEvent: adminProcedure
    .input(
      z.object({
        attendancePoolId: AttendancePoolSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.attendeeService.adminRegisterForEvent(input.userId, input.attendanceId, input.attendancePoolId)
    ),

  registerForEvent: protectedProcedure
    .input(
      z.object({
        attendancePoolId: AttendancePoolSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.attendeeService.registerForEvent(ctx.principal, input.attendanceId, input.attendancePoolId)
    }),

  deregisterForEvent: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendeeService.deregisterForEvent(ctx.principal, input.attendanceId)),

  adminDeregisterForEvent: adminProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendeeService.adminDeregisterForEvent(input.id)),

  getSelectionsResults: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getSelectionsResponseSummary(input.attendanceId)),

  registerAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        attended: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.attendeeService.updateAttended(input.attended, input.id)),

  handleQrCodeRegistration: adminProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(
      async ({ input, ctx }) => await ctx.attendeeService.handleQrCodeRegistration(ctx.principal, input.attendanceId)
    ),

  updateSelectionResponses: protectedProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        options: AttendeeSelectionResponsesSchema,
      })
    )
    .mutation(
      async ({ input, ctx }) => await ctx.attendeeService.updateSelectionResponses(input.attendeeId, input.options)
    ),

  getAttendees: publicProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendeeService.getByAttendanceId(input.attendanceId)),

  getAttendance: publicProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getById(input.id)),

  updateAttendance: adminProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        attendance: AttendanceWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.update(input.id, input.attendance)),

  mergeAttendancePools: adminProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.mergeAttendancePools(input.attendanceId)),

  getSelectionResponseResults: adminProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getSelectionsResponseSummary(input.attendanceId)),
})
