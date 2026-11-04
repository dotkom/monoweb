import type { AppRouter } from "@dotkomonline/rpc"
import { HTTP_REQUEST_SOURCE_HEADER, RpcRequestSource } from "@dotkomonline/utils"
import { type TRPCLink, httpBatchLink } from "@trpc/client"
import superjson from "superjson"

type RpcHttpLinkOptions = {
  url: string
  getAccessToken: () => Promise<string | undefined>
  onAccessTokenError: (error: unknown) => void
}

export function createRpcHttpLink(options: RpcHttpLinkOptions): TRPCLink<AppRouter> {
  return httpBatchLink<AppRouter>({
    transformer: superjson,
    url: options.url,
    async headers() {
      const headers: Record<string, string> = {
        [HTTP_REQUEST_SOURCE_HEADER]: RpcRequestSource.Web,
      }

      try {
        const accessToken = await options.getAccessToken()

        if (accessToken !== undefined && accessToken !== "") {
          headers.Authorization = `Bearer ${accessToken}`
        }
      } catch (error) {
        options.onAccessTokenError(error)
      }

      return headers
    },
    fetch(url, requestOptions) {
      return fetch(url, {
        ...requestOptions,
        credentials: "include",
      })
    },
  })
}
