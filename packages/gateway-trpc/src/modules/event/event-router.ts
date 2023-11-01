import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema, EventCommitteeSchema, EventSchema, EventWriteSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const eventRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        event: EventWriteSchema,
        committeeIds: z.array(EventCommitteeSchema.shape.committeeId),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.createEvent(input.event)
      const committees = await ctx.eventCommitteeService.setEventCommittees(event.id, input.committeeIds)
      return {
        ...event,
        committees,
      }
    }),
  edit: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        committeeIds: z.array(EventCommitteeSchema.shape.committeeId),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.updateEvent(input.id, input.event)
      await ctx.eventCommitteeService.setEventCommittees(input.id, input.committeeIds)
      return event
    }),
  all: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    const events = await ctx.eventService.getEvents(input.take, input.cursor)
    const committees = events.map(async (e) => ctx.eventCommitteeService.getEventCommitteesForEvent(e.id))

    const results = await Promise.all(committees)

    return events.map((event, i) => ({
      ...event,
      committees: results[i],
    }))
  }),
  allByCompany: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.companyEventService.getEventsByCompanyId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  allByUserId: publicProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(({ input, ctx }) =>
      ctx.eventService.getEventsByUserAttending(input.id)
    ),
  allByCommittee: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.eventService.getEventsByCommitteeId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  get: publicProcedure.input(CompanySchema.shape.id).query(async ({ input, ctx }) => {
    const event = await ctx.eventService.getEventById(input)
    const committees = await ctx.eventCommitteeService.getEventCommitteesForEvent(event.id)

    return {
      event,
      eventCommittees: committees,
    }
  }),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
})
