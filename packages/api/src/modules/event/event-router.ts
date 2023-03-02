import { CursorSchema } from "@/utils/db-utils"
import { EventWriteSchema, EventSchema, AttendanceWriteSchema } from "@dotkomonline/types"
import { z } from "zod"

import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const eventRouter = t.router({
  create: protectedProcedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.create(input)
  }),
  edit: t.procedure
    .input(
      EventWriteSchema.required({
        id: true,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.eventService.editEvent(changes.id, changes)
    }),
  all: publicProcedure
    .input(
      z.object({
        take: z.number().positive().default(20),
        cursor: CursorSchema.optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.eventService.list(input.take, input.cursor)
    }),
  get: publicProcedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.eventService.getById(input)
  }),
  addAttendance: protectedProcedure.input(AttendanceWriteSchema).mutation(async ({ input, ctx }) => {
    const attendance = await ctx.eventService.addAttendance(input.eventId, input)
    return attendance
  }),
  getAttendance: publicProcedure
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
      const res = await ctx.attendService.registerForEvent(ctx.session.user.id, input.eventId)
      return res
    }),
})
