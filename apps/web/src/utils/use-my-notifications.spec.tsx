// @vitest-environment jsdom

import type { AppRouter } from "@dotkomonline/rpc"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { TRPCClientError, createTRPCClient } from "@trpc/client"
import { observable } from "@trpc/server/observable"
import React, { act } from "react"
import { type Root, createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TRPCProvider } from "./trpc/client"
import { useMyNotifications } from "./use-my-notifications"

const session = vi.hoisted(() => ({
  user: null as { sub: string } | null,
  isLoading: false,
}))

vi.mock("@auth0/nextjs-auth0/client", () => ({ useUser: () => session }))
vi.mock("@/components/notices/identity-link-success-notice", () => ({
  useIdentityLinkRequiresLogin: () => false,
}))

let root: Root
let queryClient: QueryClient

function NotificationsProbe() {
  useMyNotifications({ enableLiveUpdates: true })
  return null
}

beforeEach(() => {
  session.user = null
  session.isLoading = false
  vi.stubGlobal("React", React)
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  root = createRoot(document.createElement("div"))
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

afterEach(async () => {
  await act(async () => root.unmount())
  queryClient.clear()
  vi.unstubAllGlobals()
})

async function renderNotifications(rejectSession = false) {
  const requestPaths: string[] = []
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      () =>
        ({ op: operation }) =>
          observable((observer) => {
            requestPaths.push(operation.path)

            if (operation.type === "subscription") {
              return
            }

            if (operation.path === "user.getMe" && rejectSession) {
              observer.error(
                TRPCClientError.from<AppRouter>({
                  error: {
                    message: "Invalid or missing credentials",
                    code: -32001,
                    data: { code: "UNAUTHORIZED", httpStatus: 401 },
                  },
                })
              )
              return
            }

            let data: unknown = { items: [], nextCursor: undefined }

            if (operation.path === "user.getMe") {
              data = { id: "user-1" }
            } else if (operation.path === "notification.getMyUnreadCount") {
              data = 0
            }

            observer.next({ result: { data } })
            observer.complete()
          }),
    ],
  })

  await act(async () => {
    root.render(
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <NotificationsProbe />
        </QueryClientProvider>
      </TRPCProvider>
    )
  })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20))
  })

  return requestPaths
}

describe("notification authentication", () => {
  it("makes no requests for a signed-out visitor", async () => {
    expect(await renderNotifications()).toEqual([])
  })

  it("waits while the session is loading", async () => {
    session.user = { sub: "user-1" }
    session.isLoading = true

    expect(await renderNotifications()).toEqual([])
  })

  it("does not query or subscribe to notifications when the server rejects the session", async () => {
    session.user = { sub: "user-1" }

    expect(await renderNotifications(true)).toEqual(["user.getMe"])
  })

  it("queries and subscribes after the server validates the user", async () => {
    session.user = { sub: "user-1" }

    expect(await renderNotifications()).toEqual(
      expect.arrayContaining([
        "user.getMe",
        "notification.getMyUnreadCount",
        "notification.getMyNotifications",
        "notification.onNewNotification",
      ])
    )
  })
})
