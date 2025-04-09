import { PaginateInputSchema } from "@dotkomonline/core"
import {
  AttendanceWriteSchema,
  CompanySchema,
  EventFilterSchema,
  EventHostingGroupSchema,
  EventInterestGroupSchema,
  EventSchema,
  EventWriteSchema,
  GroupSchema,
  InterestGroupSchema,
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
        groupIds: z.array(EventHostingGroupSchema.shape.groupId),
        interestGroupIds: z.array(EventInterestGroupSchema.shape.interestGroupId),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.createEvent(input.event)
      const groups = await ctx.eventHostingGroupService.setEventHostingGroups(event.id, input.groupIds)
      const interestGroups = await ctx.eventService.setEventInterestGroups(event.id, input.interestGroupIds)
      return {
        ...event,
        groups,
        interestGroups,
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

  editWithGroups: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        groups: z.array(EventHostingGroupSchema.shape.groupId),
        interestGroups: z.array(EventInterestGroupSchema.shape.interestGroupId),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.updateEvent(input.id, input.event)
      await ctx.eventHostingGroupService.setEventHostingGroups(input.id, input.groups)
      await ctx.eventService.setEventInterestGroups(input.id, input.interestGroups)
      return event
    }),

  // TODO: N+1 query, eventHostingGroupService and eventService should probably be merged
  all: publicProcedure
    .input(
      z
        .object({
          page: PaginateInputSchema,
          filter: EventFilterSchema.optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const events = await ctx.eventService.getEvents(input?.page, input?.filter)
      const groups = events.map(async (e) => ctx.eventHostingGroupService.getHostingGroupsForEvent(e.id))
      const interestGroups = events.map(async (e) => ctx.interestGroupService.getAllByEventId(e.id))
      const companies = events.map(async (e) => ctx.companyEventService.getCompaniesByEventId(e.id))

      const groupResults = await Promise.all(groups)
      const interestGroupResults = await Promise.all(interestGroups)
      const companyResults = await Promise.all(companies)

      return events.map((event, i) => ({
        ...event,
        groups: groupResults[i],
        interestGroups: interestGroupResults[i],
        companies: companyResults[i],
      }))
    }),

  // TODO: N+1 query, eventHostingGroupService and eventService should probably be merged
  recommended: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    const events = await ctx.eventService.getEvents(input)
    const groups = events.map(async (e) => ctx.eventHostingGroupService.getHostingGroupsForEvent(e.id))
    const interestGroups = events.map(async (e) => ctx.interestGroupService.getAllByEventId(e.id))
    const companies = events.map(async (e) => ctx.companyEventService.getCompaniesByEventId(e.id))

    const groupResults = await Promise.all(groups)
    const interestGroupResults = await Promise.all(interestGroups)
    const companyResults = await Promise.all(companies)

    return events.map((event, i) => ({
      ...event,
      groups: groupResults[i],
      interestGroups: interestGroupResults[i],
      companies: companyResults[i],
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
  allByGroup: publicProcedure
    .input(z.object({ id: GroupSchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) => ctx.eventService.getEventsByGroupId(input.id, input.paginate)),
  allByInterestGroup: publicProcedure
    .input(z.object({ id: InterestGroupSchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) => ctx.eventService.getEventsByInterestGroupId(input.id, input.paginate)),
  getAttendanceEventDetail: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.eventService.getAttendanceDetail(input)),
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
