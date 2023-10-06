import { ProductPaymentProviderWriteSchema, ProductWriteSchema } from "@dotkomonline/types";
import { protectedProcedure, t } from "../../trpc";

import { PaginateInputSchema } from "@dotkomonline/core";
import { z } from "zod";

export const productRouter = t.router({
  create: protectedProcedure
    .input(ProductWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.productService.createProduct(input)),
  get: protectedProcedure
    .input(z.string().uuid())
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
        productId: z.string().uuid(),
        paymentProviderId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.productPaymentProviderService.deletePaymentProvider(input.productId, input.paymentProviderId)
    ),
  getPaymentProvidersByProductId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => ctx.productPaymentProviderService.getAllByProductId(input)),
  hasPaymentProviderId: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        paymentProviderId: z.string(),
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.productPaymentProviderService.productHasPaymentProviderId(input.productId, input.paymentProviderId)
    ),
});
