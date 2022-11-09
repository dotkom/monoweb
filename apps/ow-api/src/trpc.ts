import { initTRPC } from "@trpc/server"

import { Context } from "./context"
import { eventRouter } from "./modules/event/event-router";
import { authRouter } from "./modules/auth/auth-router";

// TODO: Superjson
export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape
  },
})

export const appRouter = t.router({
  event: eventRouter,
  auth: authRouter
})

export type AppRouter = typeof appRouter
