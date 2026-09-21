import { env } from "@/env"
import type { CookieOptions } from "@auth0/nextjs-auth0/types"
import { minutesToSeconds } from "date-fns"
import type { NextResponse } from "next/server"

const PKCE_COOKIE_MAX_AGE_SECONDS = minutesToSeconds(15)
const PENDING_LINK_COOKIE_MAX_AGE_SECONDS = minutesToSeconds(15)
const IDENTITY_LINK_STATUS_MAX_AGE_SECONDS = minutesToSeconds(2)

export const IDENTITY_LINK_STATUS_COOKIE = "monoweb-link-status"
export const IDENTITY_LINK_STATUS_VALUE = "ok"

function isSecureOrigin() {
  return env.NEXT_PUBLIC_ORIGIN.startsWith("https://")
}

function getLinkIdentityCookiePrefix() {
  if (isSecureOrigin()) {
    return "__Secure-" as const
  }

  return "" as const
}

function getLinkIdentityCookieOptions(maxAgeSeconds: number) {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: maxAgeSeconds,
    secure: isSecureOrigin(),
  } as const satisfies CookieOptions
}

export function getLinkIdentityCookieNames() {
  const prefix = getLinkIdentityCookiePrefix()

  return {
    state: `${prefix}monoweb-link-state`,
    verifier: `${prefix}monoweb-link-verifier`,
    pendingIdToken: `${prefix}monoweb-pending-link-id-token`,
    pendingUserId: `${prefix}monoweb-pending-link-user-id`,
  } as const
}

export function applyPkceCookies(response: NextResponse, state: string, verifier: string) {
  const cookieNames = getLinkIdentityCookieNames()
  const cookieOptions = getLinkIdentityCookieOptions(PKCE_COOKIE_MAX_AGE_SECONDS)

  response.cookies.set(cookieNames.state, state, cookieOptions)
  response.cookies.set(cookieNames.verifier, verifier, cookieOptions)
}

export function clearPkceCookies(response: NextResponse) {
  const cookieNames = getLinkIdentityCookieNames()
  const cookieOptions = getLinkIdentityCookieOptions(0)

  response.cookies.set(cookieNames.state, "", cookieOptions)
  response.cookies.set(cookieNames.verifier, "", cookieOptions)
}

export function getIdentityLinkStatusCookieOptions() {
  return {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: IDENTITY_LINK_STATUS_MAX_AGE_SECONDS,
    secure: isSecureOrigin(),
  } as const satisfies CookieOptions
}

export function applyPendingLinkCookies(response: NextResponse, idToken: string, userId: string): void {
  const cookieNames = getLinkIdentityCookieNames()
  const cookieOptions = getLinkIdentityCookieOptions(PENDING_LINK_COOKIE_MAX_AGE_SECONDS)

  response.cookies.set(cookieNames.pendingIdToken, idToken, cookieOptions)
  response.cookies.set(cookieNames.pendingUserId, userId, cookieOptions)
}
