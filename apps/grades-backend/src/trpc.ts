import { getLogger } from "@dotkomonline/logger"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { TRPCError, type TRPC_ERROR_CODE_KEY, initTRPC } from "@trpc/server"
import type { MiddlewareResult } from "@trpc/server/unstable-core-do-not-import"
import { minutesToMilliseconds, secondsToMilliseconds } from "date-fns"
import superjson from "superjson"
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
import type { ServiceLayer } from "./modules/core"

export const createTrpcContext = async (context: ServiceLayer) => {
  const trpcContext = {
    ...context,
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
  return await trace.getTracer("@dotkomonline/grades-backend/trpc-request").startActiveSpan(
    `tRPC/${type}/${path}`,
    {
      root: true,
    },
    async (span) => {
      // See https://opentelemetry.io/docs/specs/semconv/registry/attributes/rpc/ and https://opentelemetry.io/docs/specs/semconv/registry/attributes/http/
      // for the meaning of these attributes.
      span.setAttribute("rpc.service", "@dotkomonline/grades-backend")
      span.setAttribute("rpc.system", "trpc")
      span.setAttribute("http.request.method", "_OTHER")
      span.setAttribute("http.request.method_original", type)
      span.setAttribute("http.route", path)

      try {
        const logger = getLogger("@dotkomonline/grades-backend/trpc")
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
          "tRPC error triggered in Request(Path=%s, Method=%s) traced by Trace(TraceID=%s): %o",
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
