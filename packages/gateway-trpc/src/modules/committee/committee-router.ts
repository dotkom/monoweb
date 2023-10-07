import { PaginateInputSchema } from "@dotkomonline/core";
import { CommitteeWriteSchema } from "@dotkomonline/types";
import { z } from "zod";

import { t } from "../../trpc";

export const committeeRouter = t.router({
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ ctx, input }) => ctx.committeeService.getCommittees(input.take, input.cursor)),
  create: t.procedure
    .input(CommitteeWriteSchema)
    .mutation(async ({ ctx, input }) => ctx.committeeService.createCommittee(input)),
  get: t.procedure.input(z.string().uuid()).query(async ({ ctx, input }) => ctx.committeeService.getCommittee(input)),
});
