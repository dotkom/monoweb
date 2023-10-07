import { PaginateInputSchema } from "@dotkomonline/core";
import { EventWriteSchema } from "@dotkomonline/types";
import { z } from "zod";

import { protectedProcedure, publicProcedure, t } from "../../trpc";
import { attendanceRouter } from "./attendance-router";
import { eventCompanyRouter } from "./event-company-router";

export const eventRouter = t.router({
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx, input }) => ctx.eventService.getEvents(input.take, input.cursor)),
  allByCommittee: publicProcedure
    .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
    .query(async ({ ctx, input }) =>
      ctx.eventService.getEventsByCommitteeId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  allByCompany: publicProcedure
    .input(z.object({ id: z.string().uuid(), paginate: PaginateInputSchema }))
    .query(async ({ ctx, input }) =>
      ctx.eventCompanyService.getEventsByCompanyId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  attendance: attendanceRouter,
  company: eventCompanyRouter,
  create: protectedProcedure
    .input(EventWriteSchema)
    .mutation(async ({ ctx, input }) => ctx.eventService.createEvent(input)),
  edit: protectedProcedure
    .input(
      EventWriteSchema.required({
        id: true,
      })
    )
    .mutation(async ({ ctx, input: changes }) => ctx.eventService.updateEvent(changes.id, changes)),
  get: publicProcedure.input(z.string().uuid()).query(async ({ ctx, input }) => ctx.eventService.getEventById(input)),
});
