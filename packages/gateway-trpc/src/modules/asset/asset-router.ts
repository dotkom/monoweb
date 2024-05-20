import {
  FileAssetUpdateSchema,
  FileAssetWriteSchema,
  ImageAssetUpdateSchema,
  ImageAssetWriteSchema,
  ImageVariantWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"
import { CursorPagination } from "@dotkomonline/core"

export const assetRouter = t.router({
  getAllFileAssets: protectedProcedure
    .input(CursorPagination.PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.assetService.getAllFileAssets(input)),
  getAllImageAssets: protectedProcedure
    .input(CursorPagination.PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.assetService.getAllImageAssets(input)),
  createFileAsset: protectedProcedure
    .input(FileAssetWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createFileAsset(input)),
  createImageAsset: protectedProcedure
    .input(ImageAssetWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.assetService.createImageAsset(input)),
  updateImageAsset: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        image: ImageAssetUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.assetService.updateImageAsset(input.id, input.image)),
  updateFileAsset: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        file: FileAssetUpdateSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.assetService.updateFileAsset(input.id, input.file)),
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
