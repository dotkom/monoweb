import { PaginateInputSchema } from "@dotkomonline/core"
import { EventEditSchema, EventSchema, EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"

export const eventRouter = t.router({
  create: protectedProcedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
    return ctx.eventService.createEvent(input)
  }),
  edit: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        changes: EventEditSchema,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventService.updateEvent(input.id, input.changes)
    }),
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.eventService.getEvents(input.take, input.cursor)
  }),
  allByCompany: publicProcedure
    .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.companyEventService.getEventsByCompanyId(input.id, input.paginate.take, input.paginate.cursor)
    }),
  allByCommittee: publicProcedure
    .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.eventService.getEventsByCommitteeId(input.id, input.paginate.take, input.paginate.cursor)
    }),
  get: publicProcedure.input(z.string().uuid()).query(({ input, ctx }) => {
    return ctx.eventService.getEventById(input)
  }),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
})
