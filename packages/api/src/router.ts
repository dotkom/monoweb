import { t } from "./trpc"
import { authRouter } from "./modules/auth/auth-router"
import { eventRouter } from "./modules/event/event-router"
import { committeeRouter } from "./modules/committee/committee-router"

export const appRouter = t.router({
  committee: committeeRouter,
  event: eventRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
