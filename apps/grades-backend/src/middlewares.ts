import type { DBHandle, Prisma } from "@dotkomonline/grades-db"
import type * as trpc from "@trpc/server/unstable-core-do-not-import"
import type { TRPCContext } from "./trpc"

type MiddlewareFunction<TContextIn, TContextOut, TInputOut> = trpc.MiddlewareFunction<
  TRPCContext,
  // Our procedure chain has no metadata
  Record<never, never>,
  TContextIn,
  TContextOut,
  TInputOut
>

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
