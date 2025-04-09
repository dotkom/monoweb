import type { Logger } from "@dotkomonline/logger"
import * as oauth from "oauth4webapi"
import { z } from "zod"

/** Default session length (access token validity) of one day */
export const defaultSessionLengthSeconds = 60 * 60 * 24

/**
 * Error type representing a client fault in the OAuth2 flow.
 *
 * This effectively means that the "client", in our case, Next.js, has done something wrong. This error will also be
 * thrown if somebody attempts to tamper with the OAuth2 endpoints.
 *
 * When this error is thrown, it means that the web browser has sent an invalid request to the server. This should be
 * mapped to a HTTP 400 response.
 */
export class OAuth2Error extends Error {}
export function isOAuth2Error(error: unknown): error is OAuth2Error {
  return error instanceof OAuth2Error
}

/**
 * Error type representing a user's refresh token being expired.
 *
 * This is thrown by refreshAccessToken() if the refresh token is expired, and suggests that the
 * user should sign in again to receive a fresh token set.
 *
 * Because the OAuth2 code is split between server and client, this error is only thrown on the server side, and should
 * be mapped to a different response to the client, suggesting that it should visit the authorize endpoint again.
 */
export class RefreshTokenExpiredError extends Error {}
export function isRefreshTokenExpiredError(error: unknown): error is RefreshTokenExpiredError {
  return error instanceof RefreshTokenExpiredError
}

export type Auth0Profile = z.infer<typeof Auth0Profile>

/** Subset of claims on the ID token that we are interested in. */
export const Auth0Profile = z.object({
  sub: z.string(),
  name: z.string(),
  nickname: z.string(),
  picture: z.string().url().optional(),
  updated_at: z.string(),
  email: z.string().email(),
  email_verified: z.boolean(),
})

/**
 * Enumeration of all the OAuth2 scopes that we support
 */
export type OAuthScope = (typeof OAuthScopes)[keyof typeof OAuthScopes]
export const OAuthScopes = {
  OpenID: "openid",
  Profile: "profile",
  Email: "email",
  OfflineAccess: "offline_access",
} as const

/** Merge the scopes into a single string. */
export function getScopeSet(...scopes: OAuthScope[]): string {
  return scopes.join(" ")
}

/** Tuple of returned values from the authorize endpoint. */
export type AuthorizeUrlResult = {
  url: URL
  state: string
  nonce: string
  verifier: string
}

export type AuthorizeUrlOptions = {
  /**
   * Override the redirect URL for the authorize URL
   *
   * This requires the client to have the redirect URL registered in the client configuration.
   */
  redirectUrl: string
  scopes: OAuthScope[]
}

export interface TokenSet {
  accessToken: string
  refreshToken: string
  idToken: string
  expiresAt: number
}

export const TokenResponse = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
  id_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  token_type: z.literal("Bearer"),
})

export class OAuth2Service {
  private readonly logger: Logger
  private readonly fetch: typeof globalThis.fetch
  private readonly issuerUrl: string
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly host: string

  public constructor(
    logger: Logger,
    fetch: typeof globalThis.fetch,
    issuerUrl: string,
    clientId: string,
    clientSecret: string,
    host: string
  ) {
    this.logger = logger
    this.fetch = fetch
    this.issuerUrl = issuerUrl
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.host = host
  }

  /**
   * Create a URL for authorizing against the authorize endpoint.
   *
   * This function returns the URL the client should redirect the user to, the state, nonce, and verifier. The remaining
   * three should be stored in the session for verification upon the callback.
   *
   * https://auth0.com/docs/authenticate/protocols/oauth#authorization-endpoint
   */
  async createAuthorizeUrl({ redirectUrl, scopes }: AuthorizeUrlOptions): Promise<AuthorizeUrlResult> {
    const verifier = oauth.generateRandomCodeVerifier()
    const challenge = await oauth.calculatePKCECodeChallenge(verifier)
    const state = oauth.generateRandomState()
    const nonce = oauth.generateRandomNonce()

    const url = new URL("/oauth2/authorize", this.issuerUrl)
    this.logger.debug("using authorize url: %s", url)
    url.searchParams.set("client_id", this.clientId)
    url.searchParams.set("redirect_uri", redirectUrl)
    // This is the Authorization Code flow.
    url.searchParams.set("response_type", "code")
    url.searchParams.set("response_mode", "query")
    url.searchParams.set("scope", getScopeSet(...scopes))
    url.searchParams.set("state", state)
    // For some reason, the Auth0 OAuth2 documentation doesn't mention these
    // parameters in the table, but they are standard OAuth2 parameters.
    url.searchParams.set("code_challenge", challenge)
    url.searchParams.set("code_challenge_method", "S256")
    url.searchParams.set("nonce", nonce)

    return {
      url,
      state,
      nonce,
      verifier,
    }
  }

  /**
   * Create a URL for logging out of the logout endpoint
   *
   * https://auth0.com/docs/authenticate/login/logout/redirect-users-after-logout
   */
  async createLogoutUrl(returnTo: string): Promise<URL> {
    // This is not a standard OAuth2 endpoint, but it is used by Auth0 to log
    // a user for a given client.
    const url = new URL("/v2/logout", this.issuerUrl)
    url.searchParams.set("client_id", this.clientId)
    url.searchParams.set("returnTo", returnTo)
    return url
  }

  /**
   * Acquire a token set from the Auth0 server given a code and the PKCE verifier used to acquire the code.
   *
   * https://auth0.com/docs/authenticate/protocols/oauth#token-endpoint
   * https://auth0.com/docs/secure/tokens/access-tokens/get-access-tokens#example-post-to-token-url
   */
  async getTokenSet(redirectUri: string, code: string, verifier: string): Promise<TokenSet> {
    const url = new URL("/oauth/token", this.issuerUrl)
    this.logger.debug("using token url: %s", url)
    const response = await this.fetch(url, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        code,
        code_verifier: verifier,
      }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new OAuth2Error(`token request failed: ${error.error} (${error.error_description})`)
    }
    const payload = await response.json()
    const tokenSet = TokenResponse.safeParse(payload)
    if (!tokenSet.success) {
      this.logger.error("failed to parse token response: %O with payload %O", tokenSet.error, payload)
      throw new OAuth2Error("failed to parse invalid token response")
    }
    return {
      accessToken: tokenSet.data.access_token,
      refreshToken: tokenSet.data.refresh_token,
      idToken: tokenSet.data.id_token,
      expiresAt: Date.now() + tokenSet.data.expires_in * 1000,
    }
  }

  /**
   * Get the user info from the Auth0 server given an access token.
   *
   * This is used to get the user's email address and other profile information.
   */
  async getUserInfo(accessToken: string): Promise<Auth0Profile> {
    const url = new URL("/userinfo", this.issuerUrl)
    const response = await this.fetch(url, {
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }),
    })

    if (!response.ok) {
      this.logger.error("failed to fetch user info: %O", await response.json())
      throw new OAuth2Error("failed to fetch user info")
    }

    const payload = await response.json()
    const userInfo = await Auth0Profile.safeParseAsync(payload)
    if (!userInfo.success) {
      this.logger.error("failed to parse user info: %O with payload %O", userInfo.error, payload)
      throw new OAuth2Error("failed to parse invalid user info")
    }

    return userInfo.data
  }

  /**
   * Attempt to refresh the access token using the refresh token.
   *
   * This is used to refresh the access token when the access token has expired. This function throws a
   * [RefreshTokenExpiredError] if the refresh token is expired.
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    const url = new URL("/oauth/token", this.issuerUrl)
    const response = await this.fetch(url, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      }),
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      // If the error problem is an invalid_grant, then it means the refresh
      // token we attempted to use is expired.
      if (error.error === "invalid_grant") {
        throw new RefreshTokenExpiredError()
      }
      this.logger.error("failed to refresh access token: %O", error)
      throw new OAuth2Error(`token request failed: ${error.error} (${error.error_description})`)
    }

    const responseBody = await response.json()
    // We have refresh token rotation enabled, so there is a new token available here.
    const tokenSet = TokenResponse.safeParse(responseBody)
    if (!tokenSet.success) {
      this.logger.error("failed to parse token response: %O", tokenSet.error)
      throw new OAuth2Error("failed to parse invalid token response")
    }
    return {
      refreshToken: tokenSet.data.refresh_token,
      accessToken: tokenSet.data.access_token,
      idToken: tokenSet.data.id_token,
      expiresAt: tokenSet.data.expires_in,
    }
  }

  /** Should the cookies sent from the server be marked as secure? */
  isClientOnHttps(): boolean {
    return this.host.startsWith("https://")
  }

  /** Get the name of the OAuth2 state cookie */
  getOAuth2StateCookieName(): string {
    return this.isClientOnHttps() ? "__Secure-monoweb-oauth2-state" : "monoweb-oauth2-state"
  }

  /** Get the name of the OAuth2 verifier cookie */
  getOAuth2VerifierCookieName(): string {
    return this.isClientOnHttps() ? "__Secure-monoweb-oauth2-verifier" : "monoweb-oauth2-verifier"
  }

  /** Get the name of the OAuth2 nonce cookie */
  getOAuth2NonceCookieName(): string {
    return this.isClientOnHttps() ? "__Secure-monoweb-oidc-nonce" : "monoweb-oidc-nonce"
  }

  getOAuth2SessionCookieName(): string {
    return this.isClientOnHttps() ? "__Secure-monoweb-session" : "monoweb-session"
  }

  getHost(): string {
    return this.host
  }
}

export function getHostname(url: string): string {
  const urlObj = new URL(url)
  return urlObj.hostname
}
