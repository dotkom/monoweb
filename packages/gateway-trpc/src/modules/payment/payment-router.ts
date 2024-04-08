import { PaginateInputSchema } from "@dotkomonline/core"
import { PaymentSchema, ProductSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"
import { productRouter } from "./product-router"
import { refundRequestRouter } from "./refund-request-router"

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
        productId: ProductSchema.shape.id,
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
        paymentId: PaymentSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.paymentService.refundPaymentById(input.paymentId)),
})
