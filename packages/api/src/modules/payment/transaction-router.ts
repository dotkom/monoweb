import { protectedProcedure } from "./../../trpc"
import { t } from "../../trpc"
import { z } from "zod"

export const transactionRouter = t.router({
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
      return ctx.transactionService.createStripeCheckoutSessionForProductId(
        input.productId,
        input.stripePublicKey,
        input.successRedirectUrl,
        input.cancelRedirectUrl,
        ctx.auth.userId
      )
    }),
})
