import { PaginateInputSchema } from "../../utils/db-utils"
import { EventWriteSchema, EventSchema, AttendanceWriteSchema } from "@dotkomonline/types"
import { z } from "zod"

import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const eventRouter = t.router({
  create: protectedProcedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.createEvent(input)
  }),
  edit: t.procedure
    .input(
      EventWriteSchema.required({
        id: true,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.eventService.updateEvent(changes.id, changes)
    }),
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.eventService.getEvents(input.take, input.cursor)
  }),
  get: publicProcedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.eventService.getEventById(input)
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
