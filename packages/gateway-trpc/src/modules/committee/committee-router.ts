import { PaginateInputSchema } from "@dotkomonline/core"
import { CommitteeSchema, CommitteeWriteSchema } from "@dotkomonline/types"
import { t } from "../../trpc"

export const committeeRouter = t.router({
  create: t.procedure
    .input(CommitteeWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.committeeService.createCommittee(input)),
  all: t.procedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.committeeService.getCommittees(input)),
  allIds: t.procedure
    .query(async ({ ctx }) => ctx.committeeService.getAllCommitteeIds()),
  get: t.procedure
    .input(CommitteeSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.committeeService.getCommittee(input)),
})
