import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema, EventCommitteeSchema, EventSchema, EventWriteSchema } from "@dotkomonline/types"
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
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.createEvent(input.event)
      const committees = ctx.eventCommitteeService.setEventCommittees(event.id, input.committees)
      return event
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        committees: z.array(EventCommitteeSchema.shape.committeeId),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input)
      const event = await ctx.eventService.updateEvent(input.id, input.event)
      await ctx.eventCommitteeService.setEventCommittees(input.id, input.committees)
      return event
    }),
  all: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    const events = await ctx.eventService.getEvents(input.take, input.cursor)
    const committees = events.map((e) => ctx.eventCommitteeService.getEventCommitteesForEvent(e.id))

    const results = await Promise.all(committees)

    return events.map((event, i) => {
      return {
        ...event,
        committees: results[i],
      }
    })
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
  get: publicProcedure.input(CompanySchema.shape.id).query(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(input)
    const committees = await ctx.eventCommitteeService.getEventCommitteesForEvent(event.id)

    return {
      event: event,
      eventCommittees: committees,
    }
  }),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
})
