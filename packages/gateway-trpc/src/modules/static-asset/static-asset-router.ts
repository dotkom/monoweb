import { StaticAssetWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, t } from "../../trpc"

export const staticAssetRouter = t.router({
  create: protectedProcedure
    .input(StaticAssetWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.staticAssetService.create(input)),
})
