import { PaginateInputSchema } from "@dotkomonline/core"
import {
  AttendanceWriteSchema,
  CompanySchema,
  EventHostingGroupSchema,
  EventSchema,
  EventWriteSchema,
  GroupSchema,
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.createEvent(input.event)
      const groups = await ctx.eventHostingGroupService.setEventHostingGroups(event.id, input.groupIds)
      return {
        ...event,
        groups,
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const event = await ctx.eventService.updateEvent(input.id, input.event)
      await ctx.eventHostingGroupService.setEventHostingGroups(input.id, input.groups)
      return event
    }),

  // TODO: N+1 query, eventHostingGroupService and eventService should probably be merged
  all: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    const events = await ctx.eventService.getEvents(input)
    const groups = events.map(async (e) => ctx.eventHostingGroupService.getHostingGroupsForEvent(e.id))

    const results = await Promise.all(groups)

    return events.map((event, i) => ({
      ...event,
      groups: results[i],
    }))
  }),

  // TODO: N+1 query, eventHostingGroupService and eventService should probably be merged
  recommended: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => {
    const events = await ctx.eventService.getEvents(input)
    const groups = events.map(async (e) => ctx.eventHostingGroupService.getHostingGroupsForEvent(e.id))

    const results = await Promise.all(groups)

    return events.map((event, i) => ({
      ...event,
      groups: results[i],
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
