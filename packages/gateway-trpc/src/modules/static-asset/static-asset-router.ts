import { AssetWriteSchema, ImageWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, t } from "../../trpc"

export const assetRouter = t.router({
  create: protectedProcedure
    .input(AssetWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.create(input)),
  createImage: protectedProcedure
    .input(ImageWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createImage(input)),
  createFile: protectedProcedure
    .input(AssetWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.create(input)),
})
