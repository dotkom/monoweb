import { TRPCError } from "@trpc/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ForbiddenError, InternalServerError, UnauthorizedError } from "./error"
import type { ServiceLayer } from "./modules/core"
import { notificationRouter } from "./modules/notification/notification-router"
import { createTrpcContext, procedure, t } from "./trpc"

const telemetry = vi.hoisted(() => ({
  warn: vi.fn(),
  error: vi.fn(),
  captureException: vi.fn(),
}))

vi.mock("@dotkomonline/logger", () => ({
  EXPORT_SPAN_ON_ERROR_ATTRIBUTE: "app.trace.export_on_error",
  getLogger: () => telemetry,
}))

vi.mock("@sentry/node", () => ({ captureException: telemetry.captureException }))

beforeEach(() => {
  vi.clearAllMocks()
})

describe("tRPC error reporting", () => {
  it("rejects anonymous unread-count requests before accessing notifications", async () => {
    const countUnreadForUser = vi.fn()
    const context = await createTrpcContext(
      null,
      { notificationService: { countUnreadForUser } } as unknown as ServiceLayer,
      "web"
    )

    await expect(notificationRouter.createCaller(context).getMyUnreadCount()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    })
    expect(countUnreadForUser).not.toHaveBeenCalled()
    expect(telemetry.warn).toHaveBeenCalledWith(
      expect.any(String),
      "<anonymous>",
      "getMyUnreadCount",
      "query",
      expect.any(String),
      "UNAUTHORIZED"
    )
    expect(telemetry.error).not.toHaveBeenCalled()
    expect(telemetry.captureException).not.toHaveBeenCalled()
  })

  it.each([
    { error: new UnauthorizedError("Missing credentials"), code: "UNAUTHORIZED" },
    { error: new ForbiddenError("Access denied"), code: "FORBIDDEN" },
    { error: new TRPCError({ code: "UNAUTHORIZED" }), code: "UNAUTHORIZED" },
    { error: new TRPCError({ code: "FORBIDDEN" }), code: "FORBIDDEN" },
  ])("reports $code as a client rejection", async ({ error, code }) => {
    const router = t.router({
      fail: procedure.query(() => {
        throw error
      }),
    })
    const context = await createTrpcContext(null, {} as ServiceLayer, "web")

    await expect(router.createCaller(context).fail()).rejects.toMatchObject({ code })
    expect(telemetry.warn).toHaveBeenCalledWith(
      expect.any(String),
      "<anonymous>",
      "fail",
      "query",
      expect.any(String),
      code
    )
    expect(telemetry.error).not.toHaveBeenCalled()
    expect(telemetry.captureException).not.toHaveBeenCalled()
  })

  it.each([
    new InternalServerError("Database unavailable"),
    new Error("Unexpected failure"),
  ])("keeps server failures in error logs and Sentry", async (error) => {
    const router = t.router({
      fail: procedure.query(() => {
        throw error
      }),
    })
    const context = await createTrpcContext(null, {} as ServiceLayer, "web")

    await expect(router.createCaller(context).fail()).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" })
    expect(telemetry.warn).not.toHaveBeenCalled()
    expect(telemetry.error).toHaveBeenCalledWith(
      expect.any(String),
      "<anonymous>",
      "fail",
      "query",
      expect.any(String),
      expect.objectContaining({ code: "INTERNAL_SERVER_ERROR", cause: error })
    )
    expect(telemetry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ code: "INTERNAL_SERVER_ERROR", cause: error })
    )
  })
})
