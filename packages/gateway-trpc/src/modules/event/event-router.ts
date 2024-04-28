import { PaginateInputSchema } from "@dotkomonline/core"
import {
  AttendanceWriteSchema,
  CompanySchema,
  EventCommitteeSchema,
  EventSchema,
  EventWriteSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"

export const eventRouter = t.router({
  get: protectedProcedure.input(EventSchema.shape.id).query(async ({ input, ctx }) => {
    return ctx.eventService.getEventById(input)
  }),
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.updateEvent(input.id, input.event)
      return event
    }),

  editWithCommittees: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        committees: z.array(EventCommitteeSchema.shape.committeeId),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.updateEvent(input.id, input.event)
      await ctx.eventCommitteeService.setEventCommittees(input.id, input.committees)
      return event
    }),

  // TODO: N+1 query, eventCommitteeService and eventService should probably be merged
  all: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    const events = await ctx.eventService.getEvents(input.take, input.cursor)
    const committees = events.map(async (e) => ctx.eventCommitteeService.getEventCommitteesForEvent(e.id))

    const results = await Promise.all(committees)

    return events.map((event, i) => ({
      ...event,
      committees: results[i],
    }))
  }),

  // TODO: N+1 query, eventCommitteeService and eventService should probably be merged
  recommended: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.eventService.getEvents(4)
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
    .query(async ({ input, ctx }) => ctx.eventService.getEventsByUserAttending(input.id)),
  allByCommittee: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.eventService.getEventsByCommitteeId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  getWebEventDetailData: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.eventService.getWebDetail(input)),
  getDashboardEventDetailData: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.eventService.getDashboardDetail(input)),
  addAttendance: protectedProcedure
    .input(
      z.object({
        obj: AttendanceWriteSchema.partial(),
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.eventService.addAttendance(input.eventId, input.obj)),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
})
