import { EventSchema } from "@dotkomonline/types"
import { z } from "zod"
import { publicProcedure, t } from "../../trpc"

export const committeeOrganizerRouter = t.router({
  get: publicProcedure
    .input(
      z.object({
        eventId: EventSchema.shape.id,
      })
    )
    .query(async ({ input, ctx }) => {
      const attendance = await ctx.committeeOrganizerService.getCommitteesForEvent(input.eventId)
      return attendance
    }),
})
