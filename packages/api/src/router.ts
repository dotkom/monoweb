import { authRouter } from "./modules/auth/auth-router"
import { committeeRouter } from "./modules/committee/committee-router"
import { companyRouter } from "./modules/company/company-router"
import { eventRouter } from "./modules/event/event-router"
import { markRouter } from "./modules/marks/mark-router"
import { paymentRouter } from "./modules/payment/payment-router"
import { t } from "./trpc"

export const appRouter = t.router({
  committee: committeeRouter,
  event: eventRouter,
  auth: authRouter,
  company: companyRouter,
  payment: paymentRouter,
  mark: markRouter,
})

export type AppRouter = typeof appRouter
