import { PaginateInputSchema } from "@dotkomonline/core";
import { CommitteeWriteSchema } from "@dotkomonline/types";
import { z } from "zod";
import { t } from "../../trpc";

export const committeeRouter = t.router({
  create: t.procedure
    .input(CommitteeWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.committeeService.createCommittee(input)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.committeeService.getCommittees(input.take, input.cursor)),
  get: t.procedure.input(z.string().uuid()).query(async ({ input, ctx }) => ctx.committeeService.getCommittee(input)),
});
