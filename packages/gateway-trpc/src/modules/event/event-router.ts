import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { CompanySchema, EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"

export const eventRouter = t.router({
  create: protectedProcedure.input(EventWriteSchema).mutation(({ input, ctx }) => {
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
