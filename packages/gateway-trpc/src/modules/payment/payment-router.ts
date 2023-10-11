import { productRouter } from "./product-router"
import { protectedProcedure } from "../../trpc"
import { refundRequestRouter } from "./refund-request-router"
import { t } from "../../trpc"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"
import { PaymentSchema, ProductSchema } from "@dotkomonline/types"

export const paymentRouter = t.router({
  product: productRouter,
  refundRequest: refundRequestRouter,
  getPaymentProviders: protectedProcedure.query(({ ctx }) => {
    return ctx.paymentService.getPaymentProviders()
  }),
  all: protectedProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.paymentService.getPayments(input.take, input.cursor)
  }),
  createStripeCheckoutSession: protectedProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
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
  refundPayment: protectedProcedure
    .input(
      z.object({
        paymentId: PaymentSchema.shape.id,
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.paymentService.refundPaymentById(input.paymentId)
    }),
})
