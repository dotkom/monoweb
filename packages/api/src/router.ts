import { authRouter } from "./modules/auth/auth-router"
import { eventRouter } from "./modules/event/event-router"
import { markRouter } from "./modules/marks/mark-router"
import { t } from "./trpc"

export const appRouter = t.router({
  event: eventRouter,
  auth: authRouter,
  mark: markRouter,
})

export type AppRouter = typeof appRouter
