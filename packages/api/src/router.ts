import { t } from "./trpc"
import { authRouter } from "./modules/auth/auth-router"
import { eventRouter } from "./modules/event/event-router"
import { committeeRouter } from "./modules/committee/committee-router"
import { companyRouter } from "./modules/company/company-router"
import { markRouter } from "./modules/marks/mark-router"

export const appRouter = t.router({
  committee: committeeRouter,
  event: eventRouter,
  auth: authRouter,
  company: companyRouter,
  mark: markRouter,
})

export type AppRouter = typeof appRouter
