import { ProductPaymentProviderWriteSchema, ProductSchema, ProductWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { adminProcedure, t } from "../../trpc"

export const productRouter = t.router({
  create: adminProcedure
    .input(ProductWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.productService.create(handle, input))
    ),
  get: adminProcedure
    .input(ProductSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.productService.getById(handle, input))
    ),
  all: adminProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.productService.getProducts(handle, input))
    ),
  addPaymentProvider: adminProcedure
    .input(ProductPaymentProviderWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.productPaymentProviderService.addPaymentProvider(handle, input))
    ),
  deletePaymentProvider: adminProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        paymentProviderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.productPaymentProviderService.deletePaymentProvider(handle, input.productId, input.paymentProviderId)
      )
    ),
  getPaymentProvidersByProductId: adminProcedure
    .input(ProductSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.productPaymentProviderService.getAllByProductId(handle, input))
    ),
  hasPaymentProviderId: adminProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        paymentProviderId: z.string(),
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.productPaymentProviderService.productHasPaymentProviderId(handle, input.productId, input.paymentProviderId)
      )
    ),
})
