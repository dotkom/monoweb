import type { DBHandle, Prisma } from "@dotkomonline/db"
import type * as trpc from "@trpc/server/unstable-core-do-not-import"
import type { Rule, RuleContext } from "./authorization"
import { ForbiddenError, UnauthorizedError } from "./error"
import type { Context } from "./trpc"

type MiddlewareFunction<TContextIn, TContextOut, TInputOut> = trpc.MiddlewareFunction<
  Context,
  // Our procedure chain has no metadata
  Record<never, never>,
  TContextIn,
  TContextOut,
  TInputOut
>

type WithPrincipal = {
  principal: Exclude<Context["principal"], null>
}

type WithTransaction = {
  handle: DBHandle
}

/**
 * tRPC Middleware to wrap the execution of the procedure in a PostgreSQL transaction
 *
 * Optionally, specify the transaction isolation level, which defaults to read-commited (default in PostgreSQL).
 */
export function withDatabaseTransaction<TContext extends Context, TInput>(
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
export function withAuditLogEntry<TContext extends Context & WithTransaction, TInput>() {
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
export function withAuthentication<TContext extends Context, TInput>() {
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
export function withAuthorization<TContext extends Context, TInput>(rule: Rule<TInput>) {
  const handler: MiddlewareFunction<TContext, TContext, TInput> = async ({ ctx, next, input }) => {
    async function evaluate<TRuleInput>(rule: Rule<TRuleInput>, context: RuleContext<TRuleInput>): Promise<boolean> {
      return await rule.evaluate(context)
    }
    const decision = evaluate(rule, {
      ctx,
      evaluate,
      input,
      principal: ctx.principal,
    })
    // IMPORTANT: We allow overriding all authorization decisions with the local environment variable
    // UNSAFE_DISABLE_AUTHORIZATION. We have additional checks in the code to prevent this to be set to true in
    // production environments
    const isOverridingAuthorization = process.env.UNSAFE_DISABLE_AUTHORIZATION === "true"

    if (!decision && !isOverridingAuthorization) {
      throw new ForbiddenError(
        `Principal(ID=${ctx.principal?.subject ?? "<anonymous>"}) is not permitted to perform this operation`
      )
    }
    return await next({ ctx })
  }
  return handler
}
