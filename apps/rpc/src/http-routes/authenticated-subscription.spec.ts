import fastify, { type FastifyInstance } from "fastify"
import { registerAuthenticatedSubscriptionGuard } from "./authenticated-subscription"

const notificationSubscriptionPath = "/api/trpc/notification.onNewNotification"

describe("authenticated subscription guard", () => {
  let server: FastifyInstance
  let validateAuthorizationHeader: ReturnType<typeof vi.fn<(authorizationHeader: string) => Promise<boolean>>>

  beforeEach(() => {
    server = fastify()
    validateAuthorizationHeader = vi.fn(async () => true)
    registerAuthenticatedSubscriptionGuard(server, validateAuthorizationHeader)
    server.get(notificationSubscriptionPath, async () => ({ connected: true }))
    server.get("/api/trpc/public.subscription", async () => ({ connected: true }))
  })

  afterEach(async () => {
    await server.close()
  })

  it("rejects an unauthenticated notification subscription before opening an event stream", async () => {
    const response = await server.inject({
      method: "GET",
      url: `${notificationSubscriptionPath}?input=%7B%22json%22%3Anull%7D`,
    })

    expect(response.statusCode).toBe(401)
    expect(response.headers["content-type"]).toContain("application/json")
    expect(response.json()).toEqual({
      error: "Unauthorized",
      message: "Invalid or missing credentials",
    })
    expect(validateAuthorizationHeader).not.toHaveBeenCalled()
  })

  it("rejects an invalid authorization header before opening an event stream", async () => {
    validateAuthorizationHeader.mockResolvedValue(false)

    const response = await server.inject({
      method: "GET",
      url: notificationSubscriptionPath,
      headers: {
        authorization: "Bearer invalid-access-token",
      },
    })

    expect(response.statusCode).toBe(401)
    expect(validateAuthorizationHeader).toHaveBeenCalledWith("Bearer invalid-access-token")
  })

  it("allows an authenticated notification subscription to reach the route handler", async () => {
    const response = await server.inject({
      method: "GET",
      url: notificationSubscriptionPath,
      headers: {
        authorization: "Bearer access-token",
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ connected: true })
    expect(validateAuthorizationHeader).toHaveBeenCalledWith("Bearer access-token")
  })

  it("does not require credentials for other subscription paths", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/api/trpc/public.subscription",
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ connected: true })
    expect(validateAuthorizationHeader).not.toHaveBeenCalled()
  })
})
