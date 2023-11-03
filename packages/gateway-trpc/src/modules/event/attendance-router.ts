import { AttendanceSchema, AttendanceWriteSchema, EventSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const attendanceRouter = t.router({
  create: protectedProcedure.input(AttendanceWriteSchema).mutation(async ({ input, ctx }) => {
    const attendance = await ctx.eventService.createAttendance(input.eventId, input)
    return attendance
  }),
  get: publicProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => {
      const attendance = await ctx.eventService.listAttendance(input.eventId)
      return attendance
    }),
  attend: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.attendanceService.registerForEvent(ctx.auth.userId, input.eventId)
      return res
    }),
  registerForEvent: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.attendanceService.registerForEvent(input.userId, input.eventId)
      return res
    }),
  deregisterForEvent: protectedProcedure
    .input(
      z.object({
        attendanceId: AttendanceSchema.shape.id,
        userId: UserSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.attendanceService.deregisterAttendee(input.userId, input.attendanceId)
      return res
    }),

  registerAttendance: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        attendanceId: z.string(),
        attended: z.boolean(),
      })
    )
    .mutation(
      async ({ input, ctx }) =>
        await ctx.attendanceService.registerForAttendance(input.userId, input.attendanceId, input.attended)
    ),
  createWaitlist: protectedProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.eventService.createWaitlist(input.eventId)),
})
