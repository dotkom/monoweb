import { auth, oauth2Service } from "@/auth"
import { env } from "@/env"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { decodeJwt } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const isHttps = env.NEXT_PUBLIC_ORIGIN.startsWith("https://")
const cookiePrefix = isHttps ? "__Secure-" : ""

export async function GET(request: Request) {
  const cookieHandle = await cookies()
  const requestUrl = new URL(request.url)

  const code = requestUrl.searchParams.get("code")
  const state = requestUrl.searchParams.get("state")
  const stateCookieName = `${cookiePrefix}monoweb-link-state`
  const verifierCookieName = `${cookiePrefix}monoweb-link-verifier`

  const expectedState = cookieHandle.get(stateCookieName)?.value
  cookieHandle.delete(stateCookieName)
  if (!code || !state || state !== expectedState) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_ORIGIN}?error=invalid_link_state`)
  }

  const verifier = cookieHandle.get(verifierCookieName)?.value
  cookieHandle.delete(verifierCookieName)
  if (!verifier) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_ORIGIN}?error=missing_link_verifier`)
  }

  const tokenSet = await oauth2Service.getTokenSet(
    `${env.NEXT_PUBLIC_ORIGIN}/api/auth/link-identity/callback`,
    code,
    verifier
  )

  const secondaryUserId = decodeJwt(tokenSet.idToken).sub
  if (!secondaryUserId) {
    return NextResponse.redirect(`${env.NEXT_PUBLIC_ORIGIN}?error=no_sub`)
  }

  const session = await auth.getServerSession()
  if (!session) {
    return NextResponse.redirect(new URL(createAuthorizeUrl(), env.NEXT_PUBLIC_ORIGIN))
  }

  const pendingCookieOptions = { path: "/", httpOnly: true, sameSite: "lax" as const, maxAge: 900, secure: isHttps }
  cookieHandle.set(`${cookiePrefix}monoweb-pending-link-id-token`, tokenSet.idToken, pendingCookieOptions)
  // This is used by the confirmation page to render the secondary user's profile, and not as any proof of ownership.
  cookieHandle.set(`${cookiePrefix}monoweb-pending-link-user-id`, secondaryUserId, pendingCookieOptions)

  return NextResponse.redirect(`${env.NEXT_PUBLIC_ORIGIN}/innstillinger/bruker/link`)
}
