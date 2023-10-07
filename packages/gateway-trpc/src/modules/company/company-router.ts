import { PaginateInputSchema } from "@dotkomonline/core";
import { CompanyWriteSchema } from "@dotkomonline/types";
import { z } from "zod";

import { t } from "../../trpc";

export const companyRouter = t.router({
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ ctx, input }) => ctx.companyService.getCompanies(input.take, input.cursor)),
  create: t.procedure
    .input(CompanyWriteSchema)
    .mutation(async ({ ctx, input }) => ctx.companyService.createCompany(input)),
  get: t.procedure.input(z.string().uuid()).query(async ({ ctx, input }) => ctx.companyService.getCompany(input)),
});
