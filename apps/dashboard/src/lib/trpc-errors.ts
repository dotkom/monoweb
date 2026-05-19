import type { AppRouter } from "@dotkomonline/rpc"
import { TRPCClientError } from "@trpc/client"

export function isTrpcErrorCode(error: unknown, code: string): boolean {
  if (!(error instanceof TRPCClientError)) {
    return false
  }

  const clientError = error as TRPCClientError<AppRouter>

  return clientError.data?.code === code
}
