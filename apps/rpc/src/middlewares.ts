import type { DBHandle, Prisma } from "@dotkomonline/db"
import type * as trpc from "@trpc/server/unstable-core-do-not-import"
import invariant from "tiny-invariant"
import type { Context } from "./trpc"

type MiddlewareFunction<TContextIn, TContextOut, TInputOut> = trpc.MiddlewareFunction<
  Context,
  // Our procedure chain has no metadata
  Record<never, never>,
  TContextIn,
  TContextOut,
  TInputOut
>

type ContextWithPrincipal = Context & {
  principal: Exclude<Context["principal"], null>
}

type ContextWithTransaction = Context & {
  handle: DBHandle
}

/**
 * tRPC Middleware to wrap the execution of the procedure in a PostgreSQL transaction
 *
 * Optionally, specify the transaction isolation level, which defaults to read-commited (default in PostgreSQL).
 */
export function withDatabaseTransaction<TInput>(isolationLevel: Prisma.TransactionIsolationLevel = "ReadCommitted") {
  const handler: MiddlewareFunction<Context, ContextWithTransaction, TInput> = async ({ ctx, next }) => {
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
export function withAuditLogEntry<TInput>() {
  const handler: MiddlewareFunction<ContextWithTransaction, ContextWithTransaction, TInput> = async ({ ctx, next }) => {
    if (ctx.principal !== null) {
      // We use a PostgreSQL configuration parameter, isolated to the current transaction to tell which user is
      // performing a change. Additionally, we have a PostgreSQL trigger on most tables to insert entries into the
      // `audit_log` table upon change. This trigger reads the configuration parameter.
      //
      // See https://www.postgresql.org/docs/9.3/functions-admin.html for details
      await ctx.handle.$executeRaw`SELECT set_config('app.current_user_id', ${ctx.principal.subject}, true)`
    }
    return await next({ ctx })
  }
  return handler
}

/** tRPC Middleware to ensure the caller is signed in */
export function authenticated<TInput>() {
  const handler: MiddlewareFunction<Context, ContextWithPrincipal, TInput> = async ({ ctx, next }) => {
    ctx.authorize.requireSignIn()
    // SAFETY: the above call should ensure this.
    invariant(ctx.principal === null)
    return next({
      ctx: Object.assign(ctx, {
        principal: ctx.principal,
      }),
    })
  }
  return handler
}

/**
 * tRPC Middleware to require the caller to have an editorial role
 *
 * We consider a user to have an editor role if they are a committee member. More specifically, you have to be a member
 * of any of the committess in `AFFILIATIONS` from /src/modules/authorization-service.ts.
 */
export function hasEditorRole<TInput>() {
  const handler: MiddlewareFunction<ContextWithPrincipal, ContextWithPrincipal, TInput> = async ({ ctx, next }) => {
    ctx.authorize.requireAffiliation()
    return next({ ctx })
  }
  return handler
}

/**
 * tRPC Middleware to require the caller to have an administrator role
 *
 * We consider a user to have an administrator role if they are a member of HS (Hovedstyret) or Dotkom.
 */
export function hasAdministratorRole<TInput>() {
  const handler: MiddlewareFunction<ContextWithPrincipal, ContextWithPrincipal, TInput> = async ({ ctx, next }) => {
    ctx.authorize.requireAffiliation(...ctx.authorize.ADMIN_AFFILIATIONS)
    return next({ ctx })
  }
  return handler
}
