import { protectedProcedure, t } from "../../trpc"

import { productRouter } from "./product-router"
import { transactionRouter } from "./transaction-router"

export const paymentRouter = t.router({
  product: productRouter,
  transaction: transactionRouter,
  getPaymentProviders: protectedProcedure.query(({ ctx }) => {
    return ctx.paymentService.getPaymentProviders()
  }),
})
