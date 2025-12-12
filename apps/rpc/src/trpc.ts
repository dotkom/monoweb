import { getLogger } from "@dotkomonline/logger"
import type { UserId } from "@dotkomonline/types"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { captureException } from "@sentry/node"
import { TRPCError, type TRPC_ERROR_CODE_KEY, initTRPC } from "@trpc/server"
import type { MiddlewareResult } from "@trpc/server/unstable-core-do-not-import"
import { minutesToMilliseconds, secondsToMilliseconds } from "date-fns"
import superjson from "superjson"
import type { Rule, RuleContext } from "./authorization"
import {
  AlreadyExistsError,
  ApplicationError,
  FailedPreconditionError,
  ForbiddenError,
  IllegalStateError,
  InternalServerError,
  InvalidArgumentError,
  NotFoundError,
  ResourceExhaustedError,
  UnauthorizedError,
  UnimplementedError,
} from "./error"
import type { EditorRoleSet } from "./modules/authorization-service"
import type { ServiceLayer } from "./modules/core"
import { isAuthorizationUnsafelyDisabled } from "./configuration"

export type Principal = {
  /** Auth0 Subject for user tokens, or Auth0 Client ID for machine tokens */
  subject: UserId
  editorRoles: EditorRoleSet
}

export const createTrpcContext = async (principal: Principal | null, context: ServiceLayer) => {
  const trpcContext = {
    ...context,
    principal,
    addAuthorizationGuard,
  }

  /**
   * Add a guard clause (rule) that has to evaluate to true, otherwise exit the procedure with a ForbiddenError.
   *
   * If the env flag `UNSAFE_DISABLE_AUTHORIZATION` equals `true`, this will never throw a ForbiddenError, and permit
   * the rule for any input.
   */
  async function addAuthorizationGuard<TRuleInput>(rule: Rule<TRuleInput>, input: TRuleInput): Promise<void> {
    async function evaluate<TRuleInput>(
      rule: Rule<TRuleInput>,
      ruleContext: RuleContext<TRuleInput>
    ): Promise<boolean> {
      return await rule.evaluate(ruleContext)
    }

    const decision = await evaluate(rule, {
      ctx: trpcContext,
      evaluate,
      input,
      principal: trpcContext.principal,
    })

    // We do not throw ForbiddenError if authorization is disabled. This effectively disables all authorization checks,
    // and will give every request access as if it was from an administrator.
    if (!decision && !isAuthorizationUnsafelyDisabled) {
      throw new ForbiddenError(
        `Principal(ID=${trpcContext.principal?.subject ?? "<anonymous>"}) is not permitted to perform this operation`
      )
    }
  }

  return trpcContext
}
export type TRPCContext = Awaited<ReturnType<typeof createTrpcContext>>

export const t = initTRPC.context<TRPCContext>().create({
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

/**
 * Create a procedure builder that can be used to create procedures.
 *
 * This helper wraps the `t.procedure` builder and adds a middleware to create an OpenTelemetry tracer span for each API
 * server call.
 */
export const procedure = t.procedure.use(async ({ ctx, path, type, next }) => {
  return await trace.getTracer("@dotkomonline/rpc/trpc-request").startActiveSpan(
    `tRPC/${type}/${path}`,
    {
      root: true,
    },
    async (span) => {
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
            message: `${result.error.cause.message} (TraceID=${traceId})`,
            cause: result.error.cause,
          })
        }

        span.recordException(error)
        span.setStatus({ code: SpanStatusCode.ERROR })

        // NOTE: We do not bother reporting authentication or authorization errors to sentry, as they are a client
        // fault.
        const isClientError = error.cause instanceof ForbiddenError || error.cause instanceof UnauthorizedError
        if (!isClientError) {
          captureException(error)
        }

        return {
          marker: result.marker,
          ok: false,
          error,
        } satisfies MiddlewareResult<unknown>
      } finally {
        span.end()
      }
    }
  )
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
  if (error instanceof ForbiddenError) {
    return "FORBIDDEN"
  }
  if (error instanceof UnauthorizedError) {
    return "UNAUTHORIZED"
  }
  // Safely presume everything else is an internal server error
  return "INTERNAL_SERVER_ERROR"
}

function _getRequire(principal: Principal | null) {
  return (condition: boolean): asserts condition => {
    if (!condition) {
      throw new ForbiddenError(`Principal(ID=${principal ?? "<anonymous>"}) is not permitted to perform this operation`)
    }
  }
}
