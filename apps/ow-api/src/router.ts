import { eventRouter } from "@/modules/event/event-router.js"

import { t } from "./trpc.js"

export const appRouter = t.router({
  event: eventRouter,
})
