import { PaginateInputSchema } from "@dotkomonline/core"
import { ProductPaymentProviderWriteSchema, ProductSchema, ProductWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, t } from "../../trpc"

export const productRouter = t.router({
  create: adminProcedure.input(ProductWriteSchema).mutation(async ({ input, ctx }) => ctx.productService.create(input)),
  get: adminProcedure.input(ProductSchema.shape.id).query(async ({ input, ctx }) => ctx.productService.getById(input)),
  all: adminProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) => ctx.productService.getProducts(input)),
  addPaymentProvider: adminProcedure
    .input(ProductPaymentProviderWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.productPaymentProviderService.addPaymentProvider(input)),
  deletePaymentProvider: adminProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        paymentProviderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.productPaymentProviderService.deletePaymentProvider(input.productId, input.paymentProviderId)
    ),
  getPaymentProvidersByProductId: adminProcedure
    .input(ProductSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.productPaymentProviderService.getAllByProductId(input)),
  hasPaymentProviderId: adminProcedure
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
