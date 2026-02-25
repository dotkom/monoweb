import type { Logger } from "@dotkomonline/logger"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { type OAuth2Service, type OAuthScope, defaultSessionLengthSeconds } from "./authentication"
import { type Session, createSession, getSession } from "./session"
import { decodeJwt } from "jose"
import { JWTExpired } from "jose/errors"

/**
 * Create a short-lived cookie intended to hold state/verifier/nonce values
 * cross-request for authorization.
 */
function createShortLivedCookie(service: OAuth2Service, cookies: ReadonlyRequestCookies, name: string, value: string) {
  cookies.set(name, value, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 300,
    secure: service.isClientOnHttps(),
  })
}

/**
 * Request variables that should have been sent from Auth0 to the callback
 * endpoint.
 *
 * If these are not present, the request is invalid and should be rejected. The
 * state and code values are used to verify that the request came from us, and
 * not from a malicious third party.
 */
const CallbackEndpointInput = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
})

export type AuthenticationHandlerOptions = {
  /** The URL the user should be redirected to after a successful login */
  homeUrl: string
  /** The URL the user should be redirected to with an ?error search parameter if callback failed */
  errorUrl: string
  /** The OAuth2 redirect URL, where Auth0 will redirect after authorize */
  redirectUrl: string
  scopes: OAuthScope[]
  /** Public host of the calling server */
  host: string
  signingKey: string
  logger: Logger
  onSignIn?: (session: Session) => Promise<void> | void
}

/**
 * Create a Next.js route handler for the OAuth2 authentication flow.
 *
 * This returns four Next.js Route Handler functions that are intended to be
 * exposed.
 */
export function createAuthenticationHandler(service: OAuth2Service, opts: AuthenticationHandlerOptions) {
  return {
    /** Begin the OAuth2 authorization code flow */
    authorize: async function authorize(request: NextRequest): Promise<NextResponse> {
      const searchParams = request.nextUrl.searchParams

      const { url, state, nonce, verifier } = await service.createAuthorizeUrl({
        redirectUrl: opts.redirectUrl,
        scopes: opts.scopes,
        connection: searchParams.get("connection") ?? undefined,
      })
      const cookieHandle = await cookies()
      createShortLivedCookie(service, cookieHandle, service.getOAuth2StateCookieName(), state)
      createShortLivedCookie(service, cookieHandle, service.getOAuth2VerifierCookieName(), verifier)
      createShortLivedCookie(service, cookieHandle, service.getOAuth2NonceCookieName(), nonce)

      const redirectAfter = searchParams.get("redirectAfter")
      if (redirectAfter !== null) {
        createShortLivedCookie(service, cookieHandle, service.getOAuth2RedirectCookieName(), redirectAfter)
      }

      return NextResponse.redirect(url)
    },
    /** Handle callback post-authorization from Auth0 */
    callback: async function callback(request: NextRequest): Promise<NextResponse> {
      const cookieHandle = await cookies()
      try {
        // Attempt to parse the state and code from the request.
        const input = await CallbackEndpointInput.safeParseAsync({
          code: request.nextUrl.searchParams.get("code"),
          state: request.nextUrl.searchParams.get("state"),
        })
        if (!input.success) {
          const url = new URL(opts.errorUrl)
          url.searchParams.set("error", "bad request, missing code and/or state")
          return NextResponse.redirect(url)
        }
        // Acquire the state cookie to match against the state value in the request.
        const expectedState = cookieHandle.get(service.getOAuth2StateCookieName())
        cookieHandle.delete(service.getOAuth2StateCookieName())
        // If the state cookie is not present, there is no reason to attempt to exchange the code for an access token, since
        // we cannot verify the state.
        if (expectedState === undefined || expectedState.value !== input.data.state) {
          const url = new URL(opts.errorUrl)
          url.searchParams.set("error", "mismatch between actual and expected oauth2 state")
          return NextResponse.redirect(url)
        }
        // Acquire the verifier cookie to match against the verifier value in the request.
        const expectedVerifier = cookieHandle.get(service.getOAuth2VerifierCookieName())
        cookieHandle.delete(service.getOAuth2VerifierCookieName())
        // If the verifier cookie is not present, there is no reason to attempt to exchange the code for an access token, since
        // we cannot verify the verifier.
        if (expectedVerifier === undefined) {
          const url = new URL(opts.errorUrl)
          url.searchParams.set("error", "missing oauth2 pkce verifier")
          return NextResponse.redirect(url)
        }
        const tokenSet = await service.getTokenSet(opts.redirectUrl, input.data.code, expectedVerifier.value)
        const userInfo = await service.getUserInfo(tokenSet.accessToken)
        const session = {
          ...userInfo,
          accessToken: tokenSet.accessToken,
          refreshToken: tokenSet.refreshToken,
        } satisfies Session
        const jwt = await createSession(session, opts.signingKey)
        // If the caller has provided a callback, call it with the session.
        await opts.onSignIn?.(session)
        cookieHandle.set(service.getOAuth2SessionCookieName(), jwt, {
          path: "/",
          httpOnly: true,
          sameSite: "lax",
          maxAge: defaultSessionLengthSeconds,
          secure: service.isClientOnHttps(),
        })

        const redirectAfter = cookieHandle.get(service.getOAuth2RedirectCookieName())
        if (redirectAfter !== undefined) {
          cookieHandle.delete(service.getOAuth2RedirectCookieName())
          return NextResponse.redirect(new URL(redirectAfter.value, opts.host))
        }

        return NextResponse.redirect(opts.homeUrl)
      } catch (error) {
        opts.logger.error("error occured in callback: %O", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
      }
    },
    /** Handle logout from Auth0 */
    logout: async function logout(_: NextRequest): Promise<NextResponse> {
      const logoutUrl = await service.createLogoutUrl(opts.host)
      const cookieHandle = await cookies()
      cookieHandle.set(service.getOAuth2SessionCookieName(), "", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        expires: new Date(0),
        secure: service.isClientOnHttps(),
      })
      return NextResponse.redirect(logoutUrl)
    },
    /** Read the current user session */
    session: async function session(_: NextRequest): Promise<NextResponse> {
      const serverSession = await this.getServerSession()
      if (serverSession === null) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      return NextResponse.json(session, { status: 200 })
    },
    getServerSession: async function getServerSession(): Promise<Session | null> {
      const cookieHandle = await cookies()
      const sessionCookie = cookieHandle.get(service.getOAuth2SessionCookieName())
      if (sessionCookie === undefined) {
        return null
      }
      try {
        const claims = decodeJwt(sessionCookie.value)
        const cutoff = new Date("2025-02-25T12:00:00Z").getTime() / 1000
        if (claims.iat !== undefined && claims.iat < cutoff) {
          cookieHandle.delete(service.getOAuth2SessionCookieName())
          return null
        }
        return await getSession(sessionCookie.value, opts.signingKey)
      } catch (err) {
        if (err instanceof JWTExpired) {
          return null
        }
        throw err
      }
    },
  }
}
