import { PaginateInputSchema } from "@dotkomonline/core"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const webshopProductRouter = t.router({
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx }) => ctx.webshopProductService.getActiveProducts()),
  createBaseProduct: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        images: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => ctx.webshopProductService.createBaseProduct(input)),

  createProductVariant: protectedProcedure
    .input(
      z.object({
        product_slug: z.string(),
        type: z.string(),
        name: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => ctx.webshopProductService.createProductVariant(input)),

  getProductBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => ctx.webshopProductService.getProductBySlug(input.slug)),
})
