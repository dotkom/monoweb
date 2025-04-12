import { TRPCError, initTRPC } from "@trpc/server"
import type { BuiltRouter, RouterRecord } from "@trpc/server/unstable-core-do-not-import"
import type { Resource } from "./authorization"
import type { Context } from "./context"
import type { AppRouter } from "./router"
import { transformer } from "./transformer"

export const t = initTRPC.context<Context>().create({
  transformer,
  errorFormatter({ shape }) {
    return shape
  },
})

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const principal = ctx.principal
  if (principal === null) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing credentials" })
  }

  return next({ ctx: { principal } })
})

export function requireAuthorizedOrThrow(ctx: Context, action: AppRouterAction, resource: Resource) {
  if (ctx.principal === null || !ctx.authorizationService.evaluate(ctx.principal, action, resource)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this resource" })
  }
}

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)

/**
 * Type for joining an array of strings by a separator.
 *
 * @example
 * ```ts
 * type S = Sep<["a", "b", "c"], "."> // "a.b.c"
 * ```
 */
type Sep<T extends string[], TSep extends string, TTail extends string | null = null> = T extends [
  infer H extends string,
  ...infer R extends string[],
]
  ? // If there are no more rest elements, then return the head
    R extends []
    ? // Otherwise, concat the head with the separator, and recurse with the
      // rest elements
      H
    : `${H}${TSep}${Sep<R, TSep, TTail>}`
  : ""

/** Collect paths from a route into a huge union of arrays, e.g ["user", "create"] | ["event", "create"] */
export type Collect<R> = R extends BuiltRouter<infer TRoot, infer TDef> ? CollectPathSet<TDef> : never

/** Collect paths from a RouterRecord, recursively */
type CollectPathSet<RR, TTail extends string[] = []> = RR extends RouterRecord
  ? // If this is a RouterRecord (i.e., not AnyProcedure), then recurse into it
    {
      [K in keyof RR]: RR[K] extends RouterRecord
        ? // Collect all the paths from the child router
          [...CollectPathSet<RR[K], [...TTail, K & string]>]
        : // Otherwise, when this is a procedure, return the path joined by the
          // current tail if present.
          TTail extends []
          ? [K & string]
          : [...TTail, K & string]
    }[keyof RR]
  : never

export type AppRouterAction = Sep<Collect<AppRouter>, ".">
