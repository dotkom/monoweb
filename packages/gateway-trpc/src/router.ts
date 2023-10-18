import { committeeRouter } from "./modules/committee/committee-router"
import { companyRouter } from "./modules/company/company-router"
import { eventRouter } from "./modules/event/event-router"
import { markRouter } from "./modules/mark/mark-router"
import { paymentRouter } from "./modules/payment/payment-router"
import { t } from "./trpc"
import { userRouter } from "./modules/user/user-router"

export const appRouter = t.router({
  committee: committeeRouter,
  event: eventRouter,
  user: userRouter,
  company: companyRouter,
  payment: paymentRouter,
  mark: markRouter,
})

export type AppRouter = typeof appRouter
