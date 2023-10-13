import { PaginateInputSchema } from "@dotkomonline/core"
import { CompanySchema, EventSchema, EventWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { attendanceRouter } from "./attendance-router"
import { eventCompanyRouter } from "./event-company-router"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const eventRouter = t.router({
  create: protectedProcedure
    .input(EventWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.eventService.createEvent(input)),
  edit: protectedProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        changes: EventWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.eventService.updateEvent(input.id, input.changes)),
  all: publicProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => ctx.eventService.getEvents(input.take, input.cursor)),
  allByCompany: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.companyEventService.getEventsByCompanyId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  allByCommittee: publicProcedure
    .input(z.object({ id: CompanySchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.eventService.getEventsByCommitteeId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  get: publicProcedure
    .input(CompanySchema.shape.id)
    .query(async ({ input, ctx }) => ctx.eventService.getEventById(input)),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
})
