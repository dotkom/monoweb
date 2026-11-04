import type { DBHandle, Prisma } from "@dotkomonline/db"
import type * as trpc from "@trpc/server/unstable-core-do-not-import"
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
    return runWithAuditLogEntry(
      { handle: ctx.handle, principal: ctx.principal, procedure: path },
      ({ setAuditTransactionName }) => next({ ctx: { setAuditTransactionName } }),
      (result) => result.ok
    )
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
 * Runs the given function with the audit log entry attached to the transaction.
 */
export async function runWithAuditLogEntry<T>(
  options: {
    handle: DBHandle
    principal: TRPCContext["principal"]
    procedure: string
  },
  fn: (args: { setAuditTransactionName: SetAuditTransactionName }) => Promise<T>,
  shouldUpdateAuditTransactionName: (result: T) => boolean = () => true
): Promise<T> {
  const { handle, principal, procedure } = options

  if (principal !== null) {
    // We use a PostgreSQL configuration parameter, isolated to the current transaction to tell which user is
    // performing a change. Additionally, we have a PostgreSQL trigger on most tables to insert entries into the
    // `audit_log` table upon change. This trigger reads the configuration parameter.
    //
    // See https://www.postgresql.org/docs/9.3/functions-admin.html for details
    //
    // The PostgreSQL trigger is found inside the migrations folder in /packages/db.
    await handle.$executeRaw`SELECT set_config('app.current_user_id', ${principal.subject}, true)`
  }

  // Create an audit event that all subsequent audit log entries will be connected to.
  // `procedure` is used as a temporary name, as the name is derived after the procedure has finished and is not known at this point.
  const auditTransaction = await handle.auditTransaction.create({
    data: { name: procedure, procedure: procedure },
  })
  await handle.$executeRaw`SELECT set_config('app.audit_transaction_id', ${auditTransaction.id}, true)`

  const auditTransactionName: { value?: string } = {}
  const result = await fn({
    setAuditTransactionName(name: string) {
      auditTransactionName.value = name
    },
  })

  if (shouldUpdateAuditTransactionName(result) && auditTransactionName.value !== undefined) {
    await handle.auditTransaction.update({
      where: { id: auditTransaction.id },
      data: { name: auditTransactionName.value },
    })
  }

  return result
}

/**
 * Runs the given function in a PostgreSQL transaction.
 */
export async function runInDatabaseTransaction<T>(
  options: {
    prisma: TRPCContext["prisma"]
    isolationLevel?: Prisma.TransactionIsolationLevel
  },
  fn: (handle: DBHandle) => Promise<T>
): Promise<T> {
  return options.prisma.$transaction(fn, {
    isolationLevel: options.isolationLevel ?? "ReadCommitted",
  })
}

type AuditedTransactionOptions = {
  prisma: TRPCContext["prisma"]
  principal: TRPCContext["principal"]
  procedure: string
  isolationLevel?: Prisma.TransactionIsolationLevel
}

type AuditedTransactionCallback<T> = (args: {
  handle: DBHandle
  setAuditTransactionName: SetAuditTransactionName
}) => Promise<T>

type AuditedTransactionFn = <T>(fn: AuditedTransactionCallback<T>) => Promise<T>

/**
 * Runs the given function in a PostgreSQL transaction with the audit log entry attached to the transaction.
 */
export async function runInAuditedDatabaseTransaction<T>(
  options: AuditedTransactionOptions,
  fn: AuditedTransactionCallback<T>
): Promise<T> {
  return runInDatabaseTransaction({ prisma: options.prisma, isolationLevel: options.isolationLevel }, (handle) =>
    runWithAuditLogEntry(
      { handle, principal: options.principal, procedure: options.procedure },
      ({ setAuditTransactionName }) => fn({ handle, setAuditTransactionName })
    )
  )
}

export function createAuditedDatabaseTransaction(options: AuditedTransactionOptions): AuditedTransactionFn {
  return (fn) => runInAuditedDatabaseTransaction(options, fn)
}
