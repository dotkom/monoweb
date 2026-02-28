import type { DBHandle, Prisma } from "@dotkomonline/db"
import type * as trpc from "@trpc/server/unstable-core-do-not-import"
import type { Rule } from "./authorization"
import { ForbiddenError, UnauthorizedError } from "./error"
import type { TRPCContext } from "./trpc"

type MiddlewareFunction<TContextIn, TContextOut, TInputOut> = trpc.MiddlewareFunction<
  TRPCContext,
  // Our procedure chain has no metadata
  Record<never, never>,
  TContextIn,
  TContextOut,
  TInputOut
>

type WithPrincipal = {
  principal: Exclude<TRPCContext["principal"], null>
}

type WithTransaction = {
  handle: DBHandle
}

/**
 * tRPC Middleware to wrap the execution of the procedure in a PostgreSQL transaction
 *
 * Optionally, specify the transaction isolation level, which defaults to read-commited (default in PostgreSQL).
 */
export function withDatabaseTransaction<TContext extends TRPCContext, TInput>(
  isolationLevel: Prisma.TransactionIsolationLevel = "ReadCommitted"
) {
  const handler: MiddlewareFunction<TContext, TContext & WithTransaction, TInput> = async ({ ctx, next }) => {
    return await ctx.prisma.$transaction(
      async (handle) => {
        return await next({
          ctx: Object.assign(ctx, {
            handle,
          }),
        })
      },
      {
        isolationLevel,
      }
    )
  }
  return handler
}

/**
 * tRPC Middleware to attach audit entry logs to the transaction, if the user is authenticated
 *
 * Audit log entries are stored in the database for most mutations. We use the audit log to keep track of changes to
 * the application.
 */
export function withAuditLogEntry<TContext extends TRPCContext & WithTransaction, TInput>() {
  const handler: MiddlewareFunction<TContext, TContext & WithTransaction, TInput> = async ({ ctx, next }) => {
    if (ctx.principal !== null) {
      // We use a PostgreSQL configuration parameter, isolated to the current transaction to tell which user is
      // performing a change. Additionally, we have a PostgreSQL trigger on most tables to insert entries into the
      // `audit_log` table upon change. This trigger reads the configuration parameter.
      //
      // See https://www.postgresql.org/docs/9.3/functions-admin.html for details
      //
      // The PostgreSQL trigger is found inside the migrations folder in /packages/db.
      await ctx.handle.$executeRaw`SELECT set_config('app.current_user_id', ${ctx.principal.subject}, true)`
    }
    return await next({ ctx })
  }
  return handler
}

/** tRPC Middleware to ensure the caller is signed in */
export function withAuthentication<TContext extends TRPCContext, TInput>() {
  const handler: MiddlewareFunction<TContext, TContext & WithPrincipal, TInput> = async ({ ctx, next }) => {
    if (ctx.principal === null) {
      throw new UnauthorizedError("Invalid or missing credentials")
    }
    return next({
      ctx: Object.assign(ctx, {
        principal: ctx.principal,
      }),
    })
  }
  return handler
}

/**
 * tRPC Middleware to evaluate the principal against the given authorization rules.
 *
 * See file /src/authorization.ts for more details on the authorization system.
 */
export function withAuthorization<TContext extends TRPCContext, TInput>(rule: Rule<TInput>) {
  const handler: MiddlewareFunction<TContext, TContext, TInput> = async ({ ctx, next, input }) => {
    await ctx.addAuthorizationGuard(rule, input)
    return await next({ ctx })
  }
  return handler
}

/**
 * tRPC Middleware to return a fallback value if the procedure throws an authentication or authorization error.
 *
 * Must be placed AFTER withDatabaseTransaction() and BEFORE withAuthentication()/withAuthorization()
 * in the middleware chain, so it can catch auth errors from downstream middleware.
 *
 * @param query - Fallback function receiving { input, ctx } and returning the fallback data
 *
 */
export function withFallbackQuery<TInput>(
  query: (args: { input: TInput; ctx: TRPCContext & WithTransaction }) => Promise<unknown>
) {
  const handler: MiddlewareFunction<TRPCContext & WithTransaction, TRPCContext & WithTransaction, TInput> = async ({
    ctx,
    next,
    input,
  }) => {
    // The error types to catch on.
    const errorTypes = [UnauthorizedError, ForbiddenError]
    const result = await next({ ctx })

    if (!result.ok && errorTypes.some((E) => result.error.cause instanceof E)) {
      return { marker: result.marker, ok: true as const, data: await query({ input, ctx }), ctx }
    }
    return result
  }
  return handler
}
