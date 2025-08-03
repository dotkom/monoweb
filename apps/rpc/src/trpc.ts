import type { UserId } from "@dotkomonline/types"
import { trace } from "@opentelemetry/api"
import { TRPCError, initTRPC } from "@trpc/server"
import superjson from "superjson"
import invariant from "tiny-invariant"
import type { Affiliation, AffiliationSet } from "./modules/authorization-service"
import type { ServiceLayer } from "./modules/core"

export type Principal = {
  /** Auth0 Subject for user tokens, or Auth0 Client ID for machine tokens */
  subject: UserId
  affiliations: AffiliationSet
}

export const createContext = async (principal: Principal | null, context: ServiceLayer) => {
  function require(condition: boolean): asserts condition {
    if (!condition) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" })
    }
  }
  return {
    ...context,
    principal,
    /** Authorization middlewares that each procedure can use to enforce access control */
    authorize: {
      /** Create a custom precondition */
      require,
      /**
       * Require that the user is signed in (i.e., the principal is not null).
       */
      requireSignIn() {
        require(principal !== null)
      },
      /**
       * Require that the user is a member of at least one group.
       *
       * If the provided list is empty, we assume permission for any group affiliation is sufficient.
       */
      requireAffiliation(...affiliations: Affiliation[]) {
        this.requireSignIn()
        invariant(principal !== null)
        require(principal.affiliations.size > 0)
        for (const affiliation of affiliations) {
          require(principal.affiliations.has(affiliation))
        }
      },
    },
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router

/**
 * Create a procedure builder that can be used to create procedures.
 *
 * This helper wraps the `t.procedure` builder and adds a middleware to create an OpenTelemetry tracer span for each API
 * server call.
 */
export const procedure = t.procedure.use(async ({ ctx, path, type, next }) => {
  return await trace.getTracer("@dotkomonline/rpc/trpc-request").startActiveSpan("tRPC procedure", async (span) => {
    // See https://opentelemetry.io/docs/specs/semconv/registry/attributes/rpc/ and https://opentelemetry.io/docs/specs/semconv/registry/attributes/http/
    // for the meaning of these attributes.
    span.setAttribute("rpc.service", "@dotkomonline/rpc")
    span.setAttribute("rpc.system", "trpc")
    span.setAttribute("http.request.method", "_OTHER")
    span.setAttribute("http.request.method_original", type)
    span.setAttribute("http.route", path)
    try {
      return await next({ ctx })
    } finally {
      span.end()
    }
  })
})

export const authenticatedProcedure = procedure.use(({ ctx, next }) => {
  ctx.authorize.requireSignIn()
  return next({
    ctx: {
      ...ctx,
      // biome-ignore lint/style/noNonNullAssertion: the above assertion ensures ctx.principal is not null
      principal: ctx.principal!,
    },
  })
})
