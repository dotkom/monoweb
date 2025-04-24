import { TRPCError, initTRPC } from "@trpc/server"
import type { Context } from "./context"
import { transformer } from "./transformer"

export const t = initTRPC.context<Context>().create({
  transformer,
  errorFormatter({ shape }) {
    return shape
  },
})

const isAuthed = t.middleware(async ({ ctx, next }) => {
  const principal = ctx.principal

  if (principal === null) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  return next({ ctx: { principal } })
})

const isAdmin = t.middleware(async ({ ctx, next }) => {
  const principal = ctx.principal
  if (principal === null) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  const adminPrincipals = ctx.adminPrincipals

  if (adminPrincipals.includes("*") || adminPrincipals.includes(principal)) {
    return next({ ctx: { principal } })
  }

  throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authorized" })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = publicProcedure.use(isAuthed)
export const adminProcedure = protectedProcedure.use(isAdmin)

export const createCallerFactory = t.createCallerFactory
