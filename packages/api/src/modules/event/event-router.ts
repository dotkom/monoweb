import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../utils/db-utils"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"

export const eventRouter = t.router({
  add: protectedProcedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.createEvent(input)
  }),
  edit: protectedProcedure
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
  attendance: attendanceRouter,
  company: eventCompanyRouter,
})
