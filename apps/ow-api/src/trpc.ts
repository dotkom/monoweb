import { getLogger } from "@dotkomonline/logger"
<<<<<<< HEAD
import { z } from "zod"

=======
>>>>>>> 8489c56 (test out oidc login)
import { initTRPC } from "@trpc/server"
import { z } from "zod"

import { Context } from "./context"

const logger = getLogger(import.meta.url)
// TODO: Superjson
export const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape
  },
})

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
      logger.info(req.input)
      return { msg: "hello world" }
    }),
})

<<<<<<< HEAD
=======
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
      return { msg: `${req.input.username}:${req.input.password} ` }
    }),
})

>>>>>>> 8489c56 (test out oidc login)
export type AppRouter = typeof appRouter
