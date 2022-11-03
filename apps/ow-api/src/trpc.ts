import { z } from "zod"

import { initTRPC } from "@trpc/server"

import { Context } from "./context"

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
      console.log("XD")
      return { msg: "hello world" }
    }),
})

export type AppRouter = typeof appRouter
