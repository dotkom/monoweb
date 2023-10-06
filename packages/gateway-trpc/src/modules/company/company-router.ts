import { z } from "zod";
import { t } from "../../trpc";
import { CompanyWriteSchema } from "@dotkomonline/types";
import { PaginateInputSchema } from "@dotkomonline/core";

export const companyRouter = t.router({
  create: t.procedure
    .input(CompanyWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.companyService.createCompany(input)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.companyService.getCompanies(input.take, input.cursor)),
  get: t.procedure.input(z.string().uuid()).query(async ({ input, ctx }) => ctx.companyService.getCompany(input)),
});
