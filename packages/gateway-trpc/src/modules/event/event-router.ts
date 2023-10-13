import { PaginateInputSchema } from "@dotkomonline/core"
import { EventCommitteeSchema, CompanySchema, EventSchema, EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"

export const eventRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        event: EventWriteSchema,
        committees: z.array(EventCommitteeSchema.shape.committeeId),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventService.createEvent(input.event, input.committees)
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        committees: z.array(EventCommitteeSchema.shape.committeeId),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.eventService.updateEvent(input.id, input.event, input.committees)
    }),
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.eventService.getEvents(input.take, input.cursor)
  }),
  allByCompany: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.companyEventService.getEventsByCompanyId(input.id, input.paginate.take, input.paginate.cursor)
    }),
  allByCommittee: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.eventService.getEventsByCommitteeId(input.id, input.paginate.take, input.paginate.cursor)
    }),
  get: publicProcedure.input(CompanySchema.shape.id).query(({ input, ctx }) => {
    return ctx.eventService.getEventById(input)
  }),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
})
