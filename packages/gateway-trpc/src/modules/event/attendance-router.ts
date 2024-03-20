import {
  AttendancePoolSchema,
  AttendancePoolWriteSchema,
  AttendanceSchema,
  AttendanceWriteSchema,
  AttendeeSchema,
  ExtrasSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  getAttendee: protectedProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
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
        attendanceId: AttendanceSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.attendeeService.registerForEvent(input.userId, input.attendanceId, new Date())
    ),

  deregisterForEvent: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendeeService.deregisterForEvent(input.id, new Date())),

  registerAttendance: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        attended: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.attendeeService.updateAttended(input.attended, input.id)),

  addExtraChoice: protectedProcedure
    .input(
      z.object({
        id: AttendeeSchema.shape.id,
        questionId: z.string(),
        choiceId: z.string(),
      })
    )
    .mutation(
      async ({ input, ctx }) => await ctx.attendeeService.updateExtraChoices(input.id, input.questionId, input.choiceId)
    ),

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

  updateExtras: protectedProcedure
    .input(
      z.object({
        id: AttendanceSchema.shape.id,
        extras: z.array(ExtrasSchema),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.attendanceService.updateExtras(input.id, input.extras)),
})
