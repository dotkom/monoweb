import { ProductPaymentProviderWriteSchema, ProductSchema, ProductWriteSchema } from "@dotkomonline/types"
import { PaginateInputSchema } from "@dotkomonline/core"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const productRouter = t.router({
  create: protectedProcedure
    .input(ProductWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.productService.createProduct(input)),
  get: protectedProcedure
    .input(ProductSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.productService.getProductById(input)),
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.productService.getProducts(input.take, input.cursor)),
  addPaymentProvider: protectedProcedure
    .input(ProductPaymentProviderWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.productPaymentProviderService.addPaymentProvider(input)),
  deletePaymentProvider: protectedProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        paymentProviderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.productPaymentProviderService.deletePaymentProvider(input.productId, input.paymentProviderId)
    ),
  getPaymentProvidersByProductId: protectedProcedure
    .input(ProductSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.productPaymentProviderService.getAllByProductId(input)),
  hasPaymentProviderId: protectedProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        paymentProviderId: z.string(),
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.productPaymentProviderService.productHasPaymentProviderId(input.productId, input.paymentProviderId)
    ),
})
