import { getLogger } from "@dotkomonline/logger"
import type { UserId } from "@dotkomonline/types"
import { SpanStatusCode, trace } from "@opentelemetry/api"
import { captureException } from "@sentry/node"
import { TRPCError, type TRPC_ERROR_CODE_KEY, initTRPC } from "@trpc/server"
import type { MiddlewareResult } from "@trpc/server/unstable-core-do-not-import"
import { minutesToMilliseconds, secondsToMilliseconds } from "date-fns"
import superjson from "superjson"
import invariant from "tiny-invariant"
import type { Rule, RuleContext } from "./authorization"
import type { Configuration } from "./configuration"
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
import { ADMIN_EDITOR_ROLES, type EditorRole, type EditorRoleSet, isEditorRole } from "./modules/authorization-service"
import type { ServiceLayer } from "./modules/core"

export type Principal = {
  /** Auth0 Subject for user tokens, or Auth0 Client ID for machine tokens */
  subject: UserId
  editorRoles: EditorRoleSet
}

type AuthorizeOptions = { localDevelopment: boolean }
type AuthorizeProps = AuthorizeOptions & { principal: Principal | null }

const getAuthorize = ({ principal, localDevelopment }: AuthorizeProps) => {
  const require = getRequire(principal)
  const requireSignIn = getRequireSignIn(principal, require)
  const requireEditorRole = getRequireEditorRole(principal, require, requireSignIn)
  const localDevelopmentRequireEditorRole = getDevelopmentRequireEditorRole(requireSignIn)
  const requireMe = getRequireMe(principal, require, requireSignIn)
  return {
    ADMIN_EDITOR_ROLES,

    require,
    requireSignIn,
    requireEditorRole: localDevelopment ? localDevelopmentRequireEditorRole : requireEditorRole,
    requireMe,
  }
}

const getCreateContext = (authorizeOptions: AuthorizeOptions) => {
  return async (principal: Principal | null, context: ServiceLayer, configuration: Configuration) => {
    const authorize = getAuthorize({ principal, ...authorizeOptions })
    const trpcContext = {
      ...context,
      principal,
      /** Authorization middlewares that each procedure can use to enforce access control */
      authorize,
      addAuthorizationGuard,
    }

    /**
     * Add a guard clause (rule) that has to evaluate to true, otherwise exit the procedure with a ForbiddenError.
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
      if (!decision) {
        throw new ForbiddenError(
          `Principal(ID=${trpcContext.principal?.subject ?? "<anonymous>"}) is not permitted to perform this operation`
        )
      }
    }

    return trpcContext
  }
}

export const createContext = getCreateContext({ localDevelopment: false })
export const createLocalDevelopmentContext = getCreateContext({ localDevelopment: true })

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

function getRequire(principal: Principal | null) {
  return (condition: boolean): asserts condition => {
    if (!condition) {
      throw new ForbiddenError(`Principal(ID=${principal ?? "<anonymous>"}) is not permitted to perform this operation`)
    }
  }
}
type Require = ReturnType<typeof getRequire>

function getRequireSignIn(principal: Principal | null, require: Require) {
  /**
   * Require that the user is signed in (i.e., the principal is not null).
   */
  return () => {
    require(principal !== null)
  }
}
type RequireSignIn = ReturnType<typeof getRequireSignIn>

function getRequireEditorRole(principal: Principal | null, require: Require, requireSignIn: RequireSignIn) {
  /**
   * Require that the user is a member of at least one of the provided groups.
   *
   * If the provided list is empty, we assume permission for any group editor role is sufficient.
   */
  return (...editorRoles: EditorRole[]) => {
    requireSignIn()

    invariant(principal !== null)
    require(principal.editorRoles.size > 0)
    for (const editorRole of editorRoles) {
      if (isEditorRole(editorRole) && principal.editorRoles.has(editorRole)) {
        return
      }
    }
    // This is fine if no editor roles were required
    require(editorRoles.length === 0)
  }
}
type RequireEditorRole = ReturnType<typeof getRequireEditorRole>

function getDevelopmentRequireEditorRole(requireSignIn: RequireSignIn): RequireEditorRole {
  /**
   * Require that the user is a member of at least one of the provided groups.
   *
   * If the provided list is empty, we assume permission for any group editor role is sufficient.
   */
  return (...editorRoles: EditorRole[]) => {
    requireSignIn()

    // For local development, you are always authorized regardless of editor roles
    return true
  }
}

function getRequireMe(principal: Principal | null, require: Require, requireSignIn: RequireSignIn) {
  /**
   * Require that the user is signed in and that the provided user id is the user's id.
   */
  return (userId: UserId) => {
    requireSignIn()
    invariant(principal !== null)
    require(principal.subject === userId)
  }
}

function getRequireMeOrEditorRole(
  principal: Principal | null,
  requireSignIn: RequireSignIn,
  requireEditorRole: RequireEditorRole
) {
  /**
   * Requires either `requireMe` or `requireEditorRole` to be true.
   *
   * One of the following must be true:
   * - The user is signed in and that the provided user id is the user's id.
   * - The user is a member of at least one of the provided groups (or any group if empty).
   */
  return (userId: UserId, editorRoles: EditorRole[]) => {
    requireSignIn()

    invariant(principal !== null)
    if (principal.subject !== userId) {
      requireEditorRole(...editorRoles)
    }
  }
}
