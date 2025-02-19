import { CommitteeSchema, CommitteeWriteSchema } from "@dotkomonline/types"
import { t } from "../../trpc"

export const committeeRouter = t.router({
  create: t.procedure
    .input(CommitteeWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.committeeService.createCommittee(input)),
  all: t.procedure.query(async ({ ctx }) => ctx.committeeService.getCommittees()),
  allIds: t.procedure.query(async ({ ctx }) => ctx.committeeService.getAllCommitteeIds()),
  get: t.procedure
    .input(CommitteeSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.committeeService.getCommittee(input)),
})
