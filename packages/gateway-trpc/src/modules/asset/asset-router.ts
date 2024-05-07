import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"
import { FileAssetSchema, ImageAssetSchema, ImageVariationWriteSchema } from "@dotkomonline/types"

export const assetRouter = t.router({
  createFileAsset: protectedProcedure
    .input(FileAssetSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createFileAsset(input)),
  createImageAsset: protectedProcedure
    .input(ImageAssetSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createImageAsset(input)),
  createImageVariation: protectedProcedure
    .input(ImageVariationWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createImageVariation(input)),
  updateImageVariation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        image: ImageVariationWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.assetService.updateImageVariation(input.id, input.image)),
})
