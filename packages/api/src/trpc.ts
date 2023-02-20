import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"

import { Context } from "./context"

export const transformer = superjson
// TODO: Superjson
export const t = initTRPC.context<Context>().create({
  transformer,
  errorFormatter({ shape }) {
    return shape
  },
})

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    })
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
