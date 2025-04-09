import type { Logger } from "@dotkomonline/logger"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { mock } from "vitest-mock-extended"
import { OAuth2Error, OAuth2Service, OAuthScopes, RefreshTokenExpiredError } from "./authentication"

describe("OAuth2Service", () => {
  let oauthService: OAuth2Service
  const fetch = vi.fn<typeof globalThis.fetch>()
  const logger = mock<Logger>()

  beforeEach(() => {
    // We mock fetch here, so it doesn't matter if the URLs here are correct or
    // not
    oauthService = new OAuth2Service(
      logger,
      fetch,
      "https://auth.online.ntnu.no",
      "a-real-client-id",
      "a-real-client-secret",
      "https://secure.local.host"
    )
  })

  it("should create a new state variables each time", async () => {
    const v1 = await oauthService.createAuthorizeUrl({ redirectUrl: "https://local.host", scopes: [] })
    const v2 = await oauthService.createAuthorizeUrl({ redirectUrl: "https://local.host", scopes: [] })
    expect(v1.state).not.toBe(v2.state)
    expect(v1.verifier).not.toBe(v2.verifier)
    expect(v1.nonce).not.toBe(v2.nonce)
  })

  it("should create a logout url that links back home", async () => {
    const url = await oauthService.createLogoutUrl("https://secure.local.host/logout")
    expect(url.toString()).toBe(
      "https://auth.online.ntnu.no/v2/logout?client_id=a-real-client-id&returnTo=https%3A%2F%2Fsecure.local.host%2Flogout"
    )
  })

  it("should properly join scopes together", async () => {
    const { url } = await oauthService.createAuthorizeUrl({
      redirectUrl: "https://local.host",
      scopes: [OAuthScopes.Profile, OAuthScopes.OfflineAccess],
    })
    expect(url.searchParams.get("scope")).toBe("profile offline_access")
  })

  it("should attempt to get the token set from a code", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          access_token: "a-real-access-token",
          refresh_token: "a-real-refresh-token",
          id_token: "a-real-id-token",
          expires_in: 3600,
          token_type: "Bearer",
        },
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    const tokenSet = await oauthService.getTokenSet(
      "https://secure.local.host/oauth2/redirect",
      "a-real-code",
      "a-real-verifier"
    )

    expect(fetch).toHaveBeenCalledTimes(1)
    const args = fetch.mock.lastCall as [URL, RequestInit]
    expect(args[0].toString()).toContain("https://auth.online.ntnu.no/oauth2/token")
    expect(args[1].method).toBe("POST")
    expect((args[1].headers as Headers).get("Content-Type")).toBe("application/x-www-form-urlencoded")
    expect(tokenSet).toEqual({
      accessToken: "a-real-access-token",
      refreshToken: "a-real-refresh-token",
      idToken: "a-real-id-token",
      expiresAt: expect.any(Number),
    })
  })

  it("should throw an oauth2 error if the endpoint did not return all tokens", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          id_token: "a-real-id-token",
          expires_in: 3600,
          token_type: "Bearer",
        },
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    await expect(
      oauthService.getTokenSet("https://secure.local.host/oauth2/redirect", "a-real-code", "a-real-verifier")
    ).rejects.toThrowError(OAuth2Error)
  })

  it("should throw an oauth2 error if the request was unsuccessful", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          error: "invalid_grant",
          error_description: "Invalid code",
        },
        {
          status: 400,
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    await expect(
      oauthService.getTokenSet("https://secure.local.host/oauth2/redirect", "a-real-code", "a-real-verifier")
    ).rejects.toThrowError(OAuth2Error)
  })

  it("should throw a fetch error if network problems occured", async () => {
    fetch.mockImplementationOnce(async () => Promise.reject(new TypeError("failed to fetch")))
    await expect(
      oauthService.getTokenSet("https://secure.local.host/oauth2/redirect", "a-real-code", "a-real-verifier")
    ).rejects.toThrowError(TypeError)
  })

  it("should return user information given an access token", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          sub: "00000000-0000-0000-0000-000000000000",
          email: "test@example.com",
          email_verified: "true",
          given_name: "Test",
          family_name: "User",
        },
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    const userInfo = await oauthService.getUserInfo("a-real-access-token")
    expect(userInfo).toEqual({
      sub: "00000000-0000-0000-0000-000000000000",
      email: "test@example.com",
      given_name: "Test",
      family_name: "User",
    })
    const args = fetch.mock.lastCall as [URL, RequestInit]
    expect(args[0].toString()).toContain("https://auth.online.ntnu.no/userinfo")
    expect((args[1].headers as Headers).get("Content-Type")).toBe("application/json")
  })

  it("should throw an oauth2 error if userinfo misses a field", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          sub: "00000000-0000-0000-0000-000000000000",
          email: "test@example.com",
        },
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    await expect(oauthService.getUserInfo("a-real-access-token")).rejects.toThrowError(OAuth2Error)
  })

  it("should throw an oauth2 error if the request was unsuccessful", async () => {
    fetch.mockImplementationOnce(
      async () =>
        new Response('{"error":"invalid_request","error_description":"Invalid request"}', {
          status: 400,
          statusText: "Bad Request",
          headers: {
            "Content-Type": "application/json",
          },
        })
    )
    await expect(
      oauthService.getTokenSet("https://secure.local.host/oauth2/redirect", "a-real-code", "a-real-verifier")
    ).rejects.toThrowError(OAuth2Error)
  })

  it("should throw a fetch error if network problems occured", async () => {
    fetch.mockImplementationOnce(async () => Promise.reject(new TypeError("failed to fetch")))
    await expect(
      oauthService.getTokenSet("https://secure.local.host/oauth2/redirect", "a-real-code", "a-real-verifier")
    ).rejects.toThrowError(TypeError)
  })

  it("should acquire a new access token with a refresh token", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          access_token: "a-real-access-token",
          refresh_token: "a-new-refresh-token",
          id_token: "a-real-id-token",
          expires_in: 3600,
          token_type: "Bearer",
        },
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    const tokenSet = await oauthService.refreshAccessToken("a-real-refresh-token-that-went-in")
    const args = fetch.mock.lastCall as [URL, RequestInit]
    expect(args[0].toString()).toContain("https://auth.online.ntnu.no/oauth2/token")
    expect(args[1].method).toBe("POST")
    expect((args[1].headers as Headers).get("Content-Type")).toBe("application/x-www-form-urlencoded")
    expect(tokenSet).toEqual({
      accessToken: "a-real-access-token",
      refreshToken: "a-new-refresh-token",
      idToken: "a-real-id-token",
      expiresAt: expect.any(Number),
    })
  })

  it("should throw a refresh token error if the refresh token had expired", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          error: "invalid_grant",
          error_description: "Invalid refresh token",
        },
        {
          status: 400,
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    await expect(oauthService.refreshAccessToken("a-real-refresh-token-that-expired")).rejects.toThrowError(
      RefreshTokenExpiredError
    )
  })

  it("should throw a fetch error if network problems occured", async () => {
    fetch.mockImplementationOnce(async () => Promise.reject(new TypeError("failed to fetch")))
    await expect(oauthService.refreshAccessToken("a-real-refresh-token-that-expired")).rejects.toThrowError(TypeError)
  })

  it("should throw an oauth2 error if the request was unsuccessful", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          error: "invalid_client",
          error_description: "Invalid refresh token",
        },
        {
          status: 400,
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    await expect(oauthService.refreshAccessToken("a-real-refresh-token-that-expired")).rejects.toThrowError(OAuth2Error)
  })

  it("should throw an oauth2 error if one of the tokens were missing", async () => {
    fetch.mockImplementationOnce(async () =>
      Response.json(
        {
          access_token: "look-ma-no-id-token",
          expires_in: 3600,
          token_type: "Bearer",
        },
        {
          status: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
        }
      )
    )
    await expect(
      oauthService.refreshAccessToken("a-real-refresh-token-that-auth0-forgot-to-give-id-token")
    ).rejects.toThrowError(OAuth2Error)
  })
})
