import { PaginateInputSchema } from "@dotkomonline/core";
import { ProductPaymentProviderWriteSchema, ProductWriteSchema } from "@dotkomonline/types";
import { z } from "zod";

import { protectedProcedure, t } from "../../trpc";

export const productRouter = t.router({
  addPaymentProvider: protectedProcedure
    .input(ProductPaymentProviderWriteSchema)
    .mutation(async ({ ctx, input }) => ctx.productPaymentProviderService.addPaymentProvider(input)),
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx, input }) => ctx.productService.getProducts(input.take, input.cursor)),
  create: protectedProcedure
    .input(ProductWriteSchema)
    .mutation(async ({ ctx, input }) => ctx.productService.createProduct(input)),
  deletePaymentProvider: protectedProcedure
    .input(
      z.object({
        paymentProviderId: z.string(),
        productId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.productPaymentProviderService.deletePaymentProvider(input.productId, input.paymentProviderId)
    ),
  get: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => ctx.productService.getProductById(input)),
  getPaymentProvidersByProductId: protectedProcedure
    .input(z.string().uuid())
    .query(async ({ ctx, input }) => ctx.productPaymentProviderService.getAllByProductId(input)),
  hasPaymentProviderId: protectedProcedure
    .input(
      z.object({
        paymentProviderId: z.string(),
        productId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) =>
      ctx.productPaymentProviderService.productHasPaymentProviderId(input.productId, input.paymentProviderId)
    ),
});
