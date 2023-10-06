import { productRouter } from "./product-router";
import { protectedProcedure } from "../../trpc";
import { refundRequestRouter } from "./refund-request-router";
import { t } from "../../trpc";
import { z } from "zod";
import { PaginateInputSchema } from "@dotkomonline/core";

export const paymentRouter = t.router({
  product: productRouter,
  refundRequest: refundRequestRouter,
  getPaymentProviders: protectedProcedure.query(({ ctx }) => ctx.paymentService.getPaymentProviders()),
  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.paymentService.getPayments(input.take, input.cursor)),
  createStripeCheckoutSession: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        stripePublicKey: z.string(),
        successRedirectUrl: z.string().url(),
        cancelRedirectUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.paymentService.createStripeCheckoutSessionForProductId(
        input.productId,
        input.stripePublicKey,
        input.successRedirectUrl,
        input.cancelRedirectUrl,
        ctx.auth.userId
      )
    ),
  refundPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.paymentService.refundPaymentById(input.paymentId)),
});
