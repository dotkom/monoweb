import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeQuestionResponsesSchema,
  AttendeeSchema,
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

  getQuestionsResults: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getQuestionResults(input.attendanceId)),

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

  updateQuestionResponses: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        choices: AttendeeQuestionResponsesSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.attendeeService.updateQuestionResponses(input.id, input.choices)),

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

  getQuestionResponseResults: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => ctx.attendanceService.getQuestionResults(input.attendanceId)),
})
