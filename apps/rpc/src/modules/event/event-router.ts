import {
  AttendanceWriteSchema,
  CompanySchema,
  EventFilterQuerySchema,
  EventSchema,
  EventWriteSchema,
  GroupSchema,
  UserSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { procedure, staffProcedure, t } from "../../trpc"
import { attendanceRouter } from "./attendance-router"
import { feedbackRouter } from "./feedback-router"

export const eventRouter = t.router({
  attendance: attendanceRouter,
  feedback: feedbackRouter,

  get: procedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventService.getEventById(handle, input))
    ),

  create: staffProcedure
    .input(
      z.object({
        event: EventWriteSchema,
        groupIds: z.array(GroupSchema.shape.slug),
        companies: z.array(CompanySchema.shape.id),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.createEvent(handle, input.event)
        return await ctx.eventService.updateEventOrganizers(
          handle,
          event.id,
          new Set(input.groupIds),
          new Set(input.companies)
        )
      })
    }),

  edit: staffProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        event: EventWriteSchema,
        groupIds: z.array(GroupSchema.shape.slug),
        companies: z.array(CompanySchema.shape.id),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const event = await ctx.eventService.updateEvent(handle, input.id, input.event)
        return await ctx.eventService.updateEventOrganizers(
          handle,
          event.id,
          new Set(input.groupIds),
          new Set(input.companies)
        )
      })
    }),

  delete: staffProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        return await ctx.eventService.deleteEvent(handle, input.id)
      })
    }),

  all: procedure
    .input(
      z
        .object({
          page: PaginateInputSchema,
          filter: EventFilterQuerySchema.optional(),
        })
        .optional()
    )
    .output(z.array(EventSchema))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.eventService.findEvents(
          handle,
          {
            byId: input?.filter?.byId ?? [],
            byStartDate: input?.filter?.byStartDate ?? { min: null, max: null },
            bySearchTerm: input?.filter?.bySearchTerm ?? null,
            byOrganizingCompany: input?.filter?.byOrganizingCompany ?? [],
            byOrganizingGroup: input?.filter?.byOrganizingGroup ?? [],
          },
          input?.page
        )
      })
    ),

  allByAttendingUserId: procedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.eventService.findEventByAttendingUserId(handle, input.id))
    ),

  addAttendance: procedure
    .input(
      z.object({
        values: AttendanceWriteSchema,
        eventId: EventSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        const attendance = await ctx.attendanceService.create(handle, input.values)
        return ctx.eventService.updateEventAttendance(handle, input.eventId, attendance.id)
      })
    }),
})
