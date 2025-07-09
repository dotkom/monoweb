import { PaginateInputSchema } from "@dotkomonline/core"
import {
  AttendanceWriteSchema,
  CompanySchema,
  type EventDetail,
  EventDetailSchema,
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
import { adminProcedure, publicProcedure, t } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"
import { feedbackRouter } from "./feedback-router"

export const eventRouter = t.router({
  get: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventService.getEventById(handle, input))
    ),
  create: adminProcedure
    .input(
      z.object({
        event: EventWriteSchema,
        groupIds: z.array(EventHostingGroupSchema.shape.groupId),
        interestGroupIds: z.array(EventInterestGroupSchema.shape.interestGroupId),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.createEvent(handle, input.event)
        const groups = await ctx.eventHostingGroupService.setEventHostingGroups(handle, event.id, input.groupIds)
        const interestGroups = await ctx.eventService.setEventInterestGroups(handle, event.id, input.interestGroupIds)
        return {
          ...event,
          groups,
          interestGroups,
        }
      })
    ),
  edit: adminProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventService.updateEvent(handle, input.id, input.event))
    ),
  editWithGroups: adminProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        groups: z.array(EventHostingGroupSchema.shape.groupId),
        interestGroups: z.array(EventInterestGroupSchema.shape.interestGroupId),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.updateEvent(handle, input.id, input.event)
        await ctx.eventHostingGroupService.setEventHostingGroups(handle, input.id, input.groups)
        await ctx.eventService.setEventInterestGroups(handle, input.id, input.interestGroups)
        return event
      })
    ),
  all: publicProcedure
    .input(z.object({ page: PaginateInputSchema, filter: EventFilterSchema.optional() }).optional())
    .output(z.array(EventDetailSchema))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const events = await ctx.eventService.getEvents(handle, input?.page, input?.filter)
        const groups = await Promise.all(
          events.map((e) => ctx.eventHostingGroupService.getHostingGroupsForEvent(handle, e.id))
        )
        const interestGroups = await Promise.all(
          events.map((e) => ctx.interestGroupService.getAllByEventId(handle, e.id))
        )
        const companies = await Promise.all(
          events.map((e) => ctx.companyEventService.getCompaniesByEventId(handle, e.id))
        )
        const attendances = await Promise.all(
          events.map((e) => (e.attendanceId ? ctx.attendanceService.getById(handle, e.attendanceId) : null))
        )

        return events.map(
          (event, i): EventDetail => ({
            event,
            hostingGroups: groups[i],
            hostingInterestGroups: interestGroups[i],
            hostingCompanies: companies[i],
            attendance: attendances[i],
          })
        )
      })
    ),
  allByUserId: publicProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventService.getEventsByUserAttending(handle, input.id))
    ),
  allByCompanyWithAttendance: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.companyEventService.getAttendanceEventsByCompanyId(handle, input.id, input.paginate)
      )
    ),
  allByGroupWithAttendance: publicProcedure
    .input(z.object({ id: GroupSchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.eventService.getAttendanceEventsByGroupId(handle, input.id, input.paginate)
      )
    ),
  allByInterestGroupWithAttendance: publicProcedure
    .input(z.object({ id: InterestGroupSchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.eventService.getAttendanceEventsByInterestGroupId(handle, input.id, input.paginate)
      )
    ),
  getEventDetail: publicProcedure
    .input(EventSchema.shape.id)
    .output(EventDetailSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventService.getEventDetail(handle, input))
    ),
  addAttendance: adminProcedure
    .input(
      z.object({
        values: AttendanceWriteSchema,
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventService.addAttendance(handle, input.eventId, input.values))
    ),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
  feedback: feedbackRouter,
})
