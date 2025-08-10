import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  AttendeeSelectionResponsesSchema,
  UserSchema,
} from "@dotkomonline/types"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { authenticatedProcedure, procedure, staffProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  createPool: staffProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        input: AttendancePoolWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.createAttendancePool(handle, input.id, input.input)
      )
    }),

  updatePool: staffProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
        input: AttendancePoolWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceByPoolId(handle, input.id)
        const pool = attendance.pools.find((pool) => pool.id === input.id)
        if (pool === undefined) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        ctx.attendanceService.updateAttendancePool(handle, input.id, { ...pool, ...input.input })
      })
    }),

  deletePool: staffProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => ctx.attendanceService.deleteAttendancePool(handle, input.id))
    }),

  adminRegisterForEvent: staffProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        return await ctx.attendanceService.registerAttendee(handle, input.attendanceId, input.userId, {
          ignoreRegistrationWindow: true,
          immediateReservation: true,
        })
      })
    }),

  registerForEvent: authenticatedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.attendanceService.registerAttendee(handle, input.attendanceId, ctx.principal.subject, {
          ignoreRegistrationWindow: false,
          immediateReservation: false,
        })
      })
    ),

  deregisterForEvent: authenticatedProcedure
    .input(
      z.object({
        attendanceId: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceById(handle, input.attendanceId)
        const attendee = attendance.attendees.find((attendee) => attendee.user.id === ctx.principal.subject)
        if (attendee === undefined) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        return await ctx.attendanceService.deregisterAttendee(handle, attendee.id, {
          ignoreDeregistrationWindow: false,
        })
      })
    }),

  adminDeregisterForEvent: staffProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.getAttendanceByAttendeeId(handle, input.attendeeId)
        const attendee = attendance.attendees.find((attendee) => attendee.user.id === ctx.principal.subject)
        if (attendee === undefined) {
          throw new TRPCError({ code: "NOT_FOUND" })
        }
        return await ctx.attendanceService.deregisterAttendee(handle, attendee.id, {
          ignoreDeregistrationWindow: true,
        })
      })
    }),

  registerAttendance: staffProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        await ctx.attendanceService.registerAttendance(handle, input.id)
      })
    }),

  updateSelectionResponses: authenticatedProcedure
    .input(
      z.object({
        attendeeId: AttendeeSchema.shape.id,
        options: AttendeeSelectionResponsesSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        await ctx.attendanceService.updateAttendeeById(handle, input.attendeeId, { selections: input.options })
      })
    }),

  getAttendance: procedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.attendanceService.getAttendanceById(handle, input.id))
    ),

  updateAttendance: authenticatedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        attendance: AttendanceWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.attendanceService.updateAttendanceById(handle, input.id, input.attendance)
      )
    ),
})
