import { PaginateInputSchema } from "@dotkomonline/core";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import { t } from "../../trpc";
import { productRouter } from "./product-router";
import { refundRequestRouter } from "./refund-request-router";

export const paymentRouter = t.router({
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ ctx, input }) => ctx.paymentService.getPayments(input.take, input.cursor)),
  createStripeCheckoutSession: protectedProcedure
    .input(
      z.object({
        cancelRedirectUrl: z.string().url(),
        productId: z.string().uuid(),
        stripePublicKey: z.string(),
        successRedirectUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.paymentService.createStripeCheckoutSessionForProductId(
        input.productId,
        input.stripePublicKey,
        input.successRedirectUrl,
        input.cancelRedirectUrl,
        ctx.auth.userId
      )
    ),
  getPaymentProviders: protectedProcedure.query(({ ctx }) => ctx.paymentService.getPaymentProviders()),
  product: productRouter,
  refundPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => ctx.paymentService.refundPaymentById(input.paymentId)),
  refundRequest: refundRequestRouter,
});
