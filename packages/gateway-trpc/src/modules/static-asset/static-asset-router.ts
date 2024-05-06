import { AssetWriteSchema, ImageWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const assetRouter = t.router({
  create: protectedProcedure
    .input(AssetWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.create(input)),
  createImage: protectedProcedure
    .input(ImageWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createImage(input)),
  updateImage: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        image: ImageWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.assetService.updateImage(input.id, input.image)),
  createFile: protectedProcedure
    .input(AssetWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.create(input)),
  getImage: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => await ctx.assetService.getImage(input)),
})
