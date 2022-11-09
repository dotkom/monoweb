import { authRouter } from "@/modules/auth/auth-router";
import { eventRouter } from "@/modules/event/event-router";
import { t } from "@/trpc"

export const appRouter = t.router({
  event: eventRouter,
  auth: authRouter,
})