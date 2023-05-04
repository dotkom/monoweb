import { productRouter } from "./product-router"
import { protectedProcedure } from "../../trpc"
import { t } from "../../trpc"
import { z } from "zod"

export const paymentRouter = t.router({
  product: productRouter,
  getPaymentProviders: protectedProcedure.query(({ ctx }) => {
    return ctx.paymentService.getPaymentProviders()
  }),
  createStripeCheckoutSession: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        stripePublicKey: z.string(),
        successRedirectUrl: z.string().url(),
        cancelRedirectUrl: z.string().url(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.paymentService.createStripeCheckoutSessionForProductId(
        input.productId,
        input.stripePublicKey,
        input.successRedirectUrl,
        input.cancelRedirectUrl,
        ctx.auth.userId
      )
    }),
  refundStripePayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().uuid(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.paymentService.refundStripePaymentById(input.paymentId)
    }),
})
