import { PaymentSchema, ProductSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"
import { productRouter } from "./product-router"
import { refundRequestRouter } from "./refund-request-router"

export const paymentRouter = t.router({
  product: productRouter,
  refundRequest: refundRequestRouter,
  getPaymentProviders: procedure.query(({ ctx }) => ctx.paymentService.getPaymentProviders()),
  all: procedure.input(PaginateInputSchema).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.paymentService.getPayments(handle, input)
    })
  ),
  createStripeCheckoutSession: authenticatedProcedure
    .input(
      z.object({
        productId: ProductSchema.shape.id,
        stripePublicKey: z.string(),
        successRedirectUrl: z.string().url(),
        cancelRedirectUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.paymentService.createStripeCheckoutSessionForProductId(
          handle,
          input.productId,
          input.stripePublicKey,
          input.successRedirectUrl,
          input.cancelRedirectUrl,
          ctx.principal.subject
        )
      )
    ),
  refundPayment: procedure
    .input(
      z.object({
        paymentId: PaymentSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.paymentService.refundPaymentById(handle, input.paymentId, { checkRefundApproval: true })
      )
    ),
})
