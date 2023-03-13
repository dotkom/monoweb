import { initTRPC, TRPCError } from "@trpc/server"
import { Context } from "./context"
import { transformer } from "./transformer"

// TODO: Superjson
export const t = initTRPC.context<Context>().create({
  transformer,
  errorFormatter({ shape }) {
    return shape
  },
})

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)
