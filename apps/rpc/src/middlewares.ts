import type { DBHandle, Prisma } from "@dotkomonline/db"
import type * as trpc from "@trpc/server/unstable-core-do-not-import"
import { withAuditContext } from "./audit-context"
import type { Rule } from "./authorization"
import { UnauthorizedError } from "./error"
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
        const result = await next({
          ctx: Object.assign(ctx, {
            handle,
          }),
        })

        if (!result.ok) {
          throw result.error
        }

        return result
      },
      {
        isolationLevel,
      }
    )
  }
  return handler
}

type SetAuditTransactionName = (name: string) => void

/**
 * tRPC Middleware to attach audit entry logs to the transaction, if the user is authenticated.
 *
 * Audit log entries are stored in the database for most mutations. We use the audit log to keep track of changes to
 * the application.
 */
export function withAuditLogEntry<TContext extends TRPCContext & WithTransaction, TInput>() {
  const handler: MiddlewareFunction<
    TContext,
    TContext & WithTransaction & { setAuditTransactionName: SetAuditTransactionName },
    TInput
  > = async ({ ctx, next, path }) => {
    const { setName } = await withAuditContext(ctx.handle, {
      path,
      procedure: path,
      userId: ctx.principal?.subject,
    })
    const auditTransactionName: { value?: string } = {}
    const result = await next({
      ctx: {
        setAuditTransactionName(name: string) {
          auditTransactionName.value = name
        },
      },
    })

    // After the procedure has finished, update the audit event with the actual name.
    if (result.ok && auditTransactionName.value !== undefined) {
      await setName(auditTransactionName.value)
    }

    return result
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
