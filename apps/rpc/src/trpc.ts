import { getLogger } from "@dotkomonline/logger"
import type { UserId } from "@dotkomonline/types"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { captureException } from "@sentry/node"
import { TRPCError, type TRPC_ERROR_CODE_KEY, initTRPC } from "@trpc/server"
import type { MiddlewareResult } from "@trpc/server/unstable-core-do-not-import"
import { minutesToMilliseconds, secondsToMilliseconds } from "date-fns"
import superjson from "superjson"
import invariant from "tiny-invariant"
import {
  AlreadyExistsError,
  ApplicationError,
  FailedPreconditionError,
  IllegalStateError,
  InternalServerError,
  InvalidArgumentError,
  NotFoundError,
  ResourceExhaustedError,
  UnimplementedError,
} from "./error"
import { type Affiliation, type AffiliationSet, isAffiliation } from "./modules/authorization-service"
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
       * Require that the user is a member of at least one of the provided groups.
       *
       * If the provided list is empty, we assume permission for any group affiliation is sufficient.
       */
      requireAffiliation(...affiliations: Affiliation[]) {
        this.requireSignIn()
        invariant(principal !== null)
        require(principal.affiliations.size > 0)
        for (const affiliation of affiliations) {
          if (isAffiliation(affiliation) && principal.affiliations.has(affiliation)) {
            return
          }
        }
        // This is fine if no affiliations were required
        require(affiliations.length === 0)
      },
      /**
       * Require that the user is signed in and that the provided user id is the user's id.
       */
      requireMe(userId: UserId) {
        this.requireSignIn()
        invariant(principal !== null)
        require(principal.subject === userId)
      },
      /**
       * Requires either `requireMe` or `requireAffiliation` to be true.
       *
       * One of the following must be true:
       * - The user is signed in and that the provided user id is the user's id.
       * - The user is a member of at least one of the provided groups (or any group if empty).
       */
      requireMeOrAffiliation(userId: UserId, affiliations: Affiliation[]) {
        this.requireSignIn()
        invariant(principal !== null)
        if (principal.subject !== userId) {
          this.requireAffiliation(...affiliations)
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
  sse: {
    maxDurationMs: minutesToMilliseconds(20),
    ping: {
      enabled: true,
      intervalMs: secondsToMilliseconds(3),
    },
    client: {
      reconnectAfterInactivityMs: secondsToMilliseconds(5),
    },
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
  return await trace
    .getTracer("@dotkomonline/rpc/trpc-request")
    .startActiveSpan(`tRPC ${type} ${path}`, async (span) => {
      // See https://opentelemetry.io/docs/specs/semconv/registry/attributes/rpc/ and https://opentelemetry.io/docs/specs/semconv/registry/attributes/http/
      // for the meaning of these attributes.
      span.setAttribute("rpc.service", "@dotkomonline/rpc")
      span.setAttribute("rpc.system", "trpc")
      span.setAttribute("http.request.method", "_OTHER")
      span.setAttribute("http.request.method_original", type)
      span.setAttribute("http.route", path)
      try {
        const logger = getLogger("@dotkomonline/rpc/trpc")
        const result = await next({ ctx })
        // This is how tRPC middlewares capture results of the procedure call. In fact, the try-finally block above is
        // not related to error handling at all, but rather to ensure the OpenTelemetry tracing span is ALWAYS ended.
        if (result.ok) {
          span.setStatus({ code: SpanStatusCode.OK })
          return result
        }
        // This means an error occurred in the procedure call, and we need to report it to the user, and send
        // the telemetry off to the OpenTelemetry backend.
        const traceId = span?.spanContext().traceId ?? "<missing traceId>"
        logger.error(
          "tRPC error triggered by Principal(Subject=%s) in Request(Path=%s, Method=%s) traced by Trace(TraceID=%s): %o",
          ctx?.principal?.subject ?? "<anonymous>",
          path,
          type,
          traceId,
          result.error
        )

        let error: TRPCError = result.error
        // If the error cause is an ApplicationError, we can try to remap it to a more specific TRPCError code that we
        // purposely know about.
        if (result.error.cause instanceof ApplicationError) {
          error = new TRPCError({
            code: getTRPCErrorCode(result.error.cause),
            message: result.error.cause.message,
            cause: result.error.cause,
          })
        }

        // We also emit the error to Sentry, as that is our primary alerting mechanism for production issues.
        captureException(error)
        span.recordException(error)
        span.setStatus({ code: SpanStatusCode.ERROR })

        return {
          marker: result.marker,
          ok: false,
          error,
        } satisfies MiddlewareResult<unknown>
      } finally {
        span.end()
      }
    })
})

/** Map an ApplicationError to a TRPCError code. */
function getTRPCErrorCode(error: ApplicationError): TRPC_ERROR_CODE_KEY {
  if (error instanceof IllegalStateError) {
    return "INTERNAL_SERVER_ERROR"
  }
  if (error instanceof UnimplementedError) {
    return "NOT_IMPLEMENTED"
  }
  if (error instanceof InternalServerError) {
    return "INTERNAL_SERVER_ERROR"
  }
  if (error instanceof InvalidArgumentError) {
    return "BAD_REQUEST"
  }
  if (error instanceof NotFoundError) {
    return "NOT_FOUND"
  }
  if (error instanceof AlreadyExistsError) {
    return "CONFLICT"
  }
  if (error instanceof FailedPreconditionError) {
    return "PRECONDITION_FAILED"
  }
  if (error instanceof ResourceExhaustedError) {
    return "CONFLICT"
  }
  // Safely presume everything else is an internal server error
  return "INTERNAL_SERVER_ERROR"
}

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

export const staffProcedure = procedure.use(({ ctx, next }) => {
  ctx.authorize.requireAffiliation()
  return next({
    ctx: {
      ...ctx,
      // biome-ignore lint/style/noNonNullAssertion: the above assertion ensures ctx.principal is not null
      principal: ctx.principal!,
    },
  })
})
