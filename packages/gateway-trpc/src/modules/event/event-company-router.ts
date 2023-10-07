import { PaginateInputSchema } from "@dotkomonline/core";
import { CompanySchema, EventSchema } from "@dotkomonline/types";
import { z } from "zod";

import { protectedProcedure, publicProcedure, t } from "../../trpc";

export const eventCompanyRouter = t.router({
  create: protectedProcedure
    .input(
      z.object({
        company: CompanySchema.shape.id,
        id: EventSchema.shape.id,
      })
    )
    .mutation(async ({ ctx, input }) => ctx.eventCompanyService.createCompany(input.id, input.company)),
  delete: protectedProcedure
    .input(
      z.object({
        company: CompanySchema.shape.id,
        id: EventSchema.shape.id,
      })
    )
    .mutation(async ({ ctx, input }) => ctx.eventCompanyService.deleteCompany(input.id, input.company)),
  get: publicProcedure
    .input(
      z.object({
        id: EventSchema.shape.id,
        pagination: PaginateInputSchema,
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.eventCompanyService.getCompaniesByEventId(input.id, input.pagination.take, input.pagination.cursor)
    ),
});
