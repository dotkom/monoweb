import { NextRequest, NextResponse } from "next/server"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const authMocks = vi.hoisted(() => ({
  middleware: vi.fn(),
  getSession: vi.fn(),
  getServerSession: vi.fn(),
  getServerAuthorization: vi.fn(),
}))

vi.mock("@/lib/auth0", () => ({ auth0: authMocks }))
vi.mock("@/lib/link-identity-cookies", () => ({ IDENTITY_LINK_STATUS_COOKIE: "identity_link_status" }))
vi.mock("@admin/lib/auth", () => ({ getServerSession: authMocks.getServerSession }))
vi.mock("@admin/lib/server-authorization", () => ({ getServerAuthorization: authMocks.getServerAuthorization }))
vi.mock("@dotkomonline/ui", () => ({ Text: "p", Title: "h1" }))
vi.mock("@tabler/icons-react", () => ({ IconShieldLock: "svg" }))

import UnauthorizedPage from "../app/(web)/admin/ikke-tilgang/page"
import { proxy } from "../proxy"

beforeEach(() => {
  vi.resetAllMocks()
  // The test runner uses the classic JSX transform for Next.js's preserved JSX.
  vi.stubGlobal("React", React)
  authMocks.middleware.mockResolvedValue(NextResponse.next())
  authMocks.getSession.mockResolvedValue(null)
  authMocks.getServerSession.mockResolvedValue(null)
  authMocks.getServerAuthorization.mockResolvedValue({ isCommitteeMember: false })
})

describe("admin login redirects", () => {
  it.each([
    "/admin",
    "/admin/arrangementer?tab=all",
    "/admin/ikke-tilgang",
  ])("sends a signed-out visitor at %s to login and preserves the return path", async (path) => {
    const response = await proxy(new NextRequest(`https://online.ntnu.no${path}`))
    const destination = new URL(response.headers.get("location") ?? "")
    expect(destination.pathname).toBe("/api/auth/authorize")
    expect(destination.searchParams.get("returnTo")).toBe(path)
  })

  it.each([
    "/",
    "/administrator",
    "/api/auth/authorize?returnTo=%2Fadmin",
  ])("keeps signed-out requests to %s outside the admin login guard", async (path) => {
    const response = await proxy(new NextRequest(`https://online.ntnu.no${path}`))
    expect(response.headers.get("location")).toBeNull()
  })
})

describe("access-denied page", () => {
  it("redirects committee members to admin", async () => {
    authMocks.getServerSession.mockResolvedValue({ user: { sub: "member" } })
    authMocks.getServerAuthorization.mockResolvedValue({ isCommitteeMember: true })
    await expect(UnauthorizedPage()).rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/admin;307;" })
  })

  it("sends a signed-out visitor to login instead of rendering the denial", async () => {
    await expect(UnauthorizedPage()).rejects.toMatchObject({
      digest: "NEXT_REDIRECT;replace;/api/auth/authorize?returnTo=%2Fadmin;307;",
    })
    expect(authMocks.getServerAuthorization).not.toHaveBeenCalled()
  })

  it("renders the denial for a signed-in visitor without committee access", async () => {
    authMocks.getServerSession.mockResolvedValue({ user: { sub: "non-member" } })
    expect(React.isValidElement(await UnauthorizedPage())).toBe(true)
  })
})
