import { initTRPC } from "@trpc/server"

import { Context } from "./context"
import { authRouter } from "./modules/auth/auth-router"
import { eventRouter } from "./modules/event/event-router"

// TODO: Superjson
export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape
  },
})

export const appRouter = t.router({
  event: eventRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter
