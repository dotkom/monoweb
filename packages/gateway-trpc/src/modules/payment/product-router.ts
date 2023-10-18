import { ProductPaymentProviderWriteSchema, ProductSchema, ProductWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, t } from "../../trpc"

import { PaginateInputSchema } from "@dotkomonline/core"
import { z } from "zod"

export const productRouter = t.router({
  create: protectedProcedure.input(ProductWriteSchema).mutation(({ input, ctx }) => {
    return ctx.productService.createProduct(input)
  }),
  get: protectedProcedure.input(ProductSchema.shape.id).query(({ input, ctx }) => {
    return ctx.productService.getProductById(input)
  }),
  all: protectedProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.productService.getProducts(input.take, input.cursor)
  }),
  addPaymentProvider: protectedProcedure.input(ProductPaymentProviderWriteSchema).mutation(({ input, ctx }) => {
    return ctx.productPaymentProviderService.addPaymentProvider(input)
  }),
  deletePaymentProvider: protectedProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        paymentProviderId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.productPaymentProviderService.deletePaymentProvider(input.productId, input.paymentProviderId)
    }),
  getPaymentProvidersByProductId: protectedProcedure.input(ProductSchema.shape.id).query(({ input, ctx }) => {
    return ctx.productPaymentProviderService.getAllByProductId(input)
  }),
  hasPaymentProviderId: protectedProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        paymentProviderId: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.productPaymentProviderService.productHasPaymentProviderId(input.productId, input.paymentProviderId)
    }),
})
