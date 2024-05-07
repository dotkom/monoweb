import { FileAssetSchema, ImageAssetSchema, ImageVariantWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const assetRouter = t.router({
  createFileAsset: protectedProcedure
    .input(FileAssetSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createFileAsset(input)),
  createImageAsset: protectedProcedure
    .input(ImageAssetSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createImageAsset(input)),
  createImageVariation: protectedProcedure
    .input(ImageVariantWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createImageVariation(input)),
  updateImageVariation: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        image: ImageVariantWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.assetService.updateImageVariation(input.id, input.image)),
})
