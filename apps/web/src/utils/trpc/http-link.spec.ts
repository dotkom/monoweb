import type { AppRouter } from "@dotkomonline/rpc"
import { HTTP_REQUEST_SOURCE_HEADER, RpcRequestSource } from "@dotkomonline/utils"
import { createTRPCUntypedClient } from "@trpc/client"
import superjson from "superjson"
import { afterEach, describe, expect, it, vi } from "vitest"
import { createRpcHttpLink } from "./http-link"

function createTestClient(getAccessToken: () => Promise<string | undefined>) {
  const fetchRequest = vi.fn<typeof fetch>().mockImplementation(async () => {
    return new Response(JSON.stringify([{ result: { data: superjson.serialize(0) } }]))
  })
  const onAccessTokenError = vi.fn()
  vi.stubGlobal("fetch", fetchRequest)

  const client = createTRPCUntypedClient<AppRouter>({
    links: [
      createRpcHttpLink({
        url: "https://rpc.example.com/api/trpc",
        getAccessToken,
        onAccessTokenError,
      }),
    ],
  })

  return { client, fetchRequest, onAccessTokenError }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("RPC HTTP authentication", () => {
  it.each([
    "notification.getMyUnreadCount",
    "user.getMe",
    "event.allSummaries",
  ])("attaches credentials to %s without classifying the route", async (path) => {
    const { client, fetchRequest } = createTestClient(async () => "access-token")

    await expect(client.query(path)).resolves.toBe(0)

    const requestOptions = fetchRequest.mock.calls[0]?.[1]
    const headers = new Headers(requestOptions?.headers)
    expect(headers.get("Authorization")).toBe("Bearer access-token")
    expect(headers.get(HTTP_REQUEST_SOURCE_HEADER)).toBe(RpcRequestSource.Web)
    expect(requestOptions?.credentials).toBe("include")
  })

  it.each([undefined, ""])("omits the bearer header when no token is available (%s)", async (accessToken) => {
    const { client, fetchRequest } = createTestClient(async () => accessToken)

    await expect(client.query("event.allSummaries")).resolves.toBe(0)
    expect(new Headers(fetchRequest.mock.calls[0]?.[1]?.headers).has("Authorization")).toBe(false)
    expect(fetchRequest.mock.calls[0]?.[1]?.credentials).toBe("include")
  })

  it("runs session recovery on token failure and leaves authentication enforcement to the server", async () => {
    const tokenError = new Error("Refresh token rejected")
    const { client, fetchRequest, onAccessTokenError } = createTestClient(async () => {
      throw tokenError
    })

    await expect(client.query("user.getMe")).resolves.toBe(0)
    expect(onAccessTokenError).toHaveBeenCalledWith(tokenError)
    expect(new Headers(fetchRequest.mock.calls[0]?.[1]?.headers).has("Authorization")).toBe(false)
  })

  it("batches notification and public queries together", async () => {
    const { client, fetchRequest } = createTestClient(async () => "access-token")
    fetchRequest.mockResolvedValueOnce(
      new Response(
        JSON.stringify([{ result: { data: superjson.serialize(0) } }, { result: { data: superjson.serialize(0) } }])
      )
    )

    await expect(
      Promise.all([client.query("notification.getMyUnreadCount"), client.query("event.allSummaries")])
    ).resolves.toEqual([0, 0])
    expect(fetchRequest).toHaveBeenCalledTimes(1)
    expect(String(fetchRequest.mock.calls[0]?.[0])).toContain("notification.getMyUnreadCount,event.allSummaries")
  })
})
