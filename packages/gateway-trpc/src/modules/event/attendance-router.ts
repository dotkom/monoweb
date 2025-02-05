import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  ExtraSchema,
  ExtrasChoices,
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
    .mutation(async ({ input, ctx }) => ctx.attendancePoolService.create(input)),

  updatePool: protectedProcedure
    .input(
      z.object({
        input: AttendancePoolWriteSchema.partial(),
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendancePoolService.update(input.input, input.id)),

  deletePool: protectedProcedure
    .input(
      z.object({
        id: AttendancePoolSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendancePoolService.delete(input.id)),

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

  setExtrasChoices: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        choices: ExtrasChoices,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.attendeeService.updateExtraChoices(input.id, input.choices)),

  getPoolsByAttendanceId: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendancePoolService.getByAttendanceId(input.id)),

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
    .mutation(async ({ input, ctx }) => ctx.attendanceService.update(input.attendance, input.id)),
  mergeAttendance: protectedProcedure
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

  updateExtras: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        extras: z.array(ExtraSchema),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.updateExtras(input.id, input.extras)),

  getWaitlist: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.waitlistAttendeService.getByAttendanceId(input.id)),

  getExtrasResults: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getExtrasResults(input.attendanceId)),
})
