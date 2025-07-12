import { TRPCError, initTRPC } from "@trpc/server"
import superjson from "superjson"
import { articleRouter } from "./modules/article/article-router"
import { companyRouter } from "./modules/company/company-router"
import type { ServiceLayer } from "./modules/core"
import { attendanceRouter } from "./modules/event/attendance-router"
import { eventRouter } from "./modules/event/event-router"
import { groupRouter } from "./modules/group/group-router"
import { interestGroupRouter } from "./modules/interest-group/interest-group-router"
import { jobListingRouter } from "./modules/job-listing/job-listing-router"
import { markRouter } from "./modules/mark/mark-router"
import { personalMarkRouter } from "./modules/mark/personal-mark-router"
import { offlineRouter } from "./modules/offline/offline-router"
import { paymentRouter } from "./modules/payment/payment-router"
import { userRouter } from "./modules/user/user-router"

export type CreateContextOptions = {
  // auth0 sub
  principal: string | null
  // auth0 subs
  adminPrincipals: string[]
}

export const createContext = async ({ principal, adminPrincipals }: CreateContextOptions, context: ServiceLayer) => {
  return {
    ...context,
    principal,
    adminPrincipals,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

const isAuthed = t.middleware(async ({ ctx, next, path }) => {
  const principal = ctx.principal

  if (principal === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `${principal} is not authorized for protectedProcedure ${path}`,
    })
  }

  return next({ ctx: { principal } })
})

const isAdmin = t.middleware(async ({ ctx, next, path }) => {
  const principal = ctx.principal
  if (principal === null) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" })
  }

  const adminPrincipals = ctx.adminPrincipals

  if (adminPrincipals.includes("*") || adminPrincipals.includes(principal)) {
    return next({ ctx: { principal } })
  }

  throw new TRPCError({ code: "UNAUTHORIZED", message: `${principal} is not authorized for adminProcedure ${path}` })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = publicProcedure.use(isAuthed)
export const adminProcedure = protectedProcedure.use(isAdmin)
