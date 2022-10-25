import { getLogger } from "@dotkomonline/logger"
import { initTRPC } from "@trpc/server"
import { z } from "zod"

export const t = initTRPC.create()

const logger = getLogger(import.meta.url)
export const appRouter = t.router({
  signin: t.procedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
        loginChallenge: z.string(),
      })
    )
    .mutation((req) => {
      logger.info(JSON.stringify(req))
      return { msg: "hello world" }
    }),
})

export type AppRouter = typeof appRouter
