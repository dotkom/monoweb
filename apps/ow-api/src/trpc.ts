import { getLogger } from "@dotkomonline/logger"
import { z } from "zod"

import { initTRPC } from "@trpc/server"

import { Context } from "./index.js"

const logger = getLogger(import.meta.url)
export const appRouter = t.router({
  signin: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        challenge: z.string(),
      })
    )
    .mutation((req) => {
      logger.info(JSON.stringify(req))
      return { msg: "hello world" }
    }),
})

export type AppRouter = typeof appRouter
export const t = initTRPC.context<Context>().create()
