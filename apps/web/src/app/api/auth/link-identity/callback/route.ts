import { getServerSession } from "@/auth"
import { env } from "@/env"
import { applyPendingLinkCookies, clearPkceCookies, getLinkIdentityCookieNames } from "@/lib/link-identity-cookies"
import { exchangeLinkIdentityCode } from "@/lib/link-identity-oauth"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { decodeJwt } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

function redirectWithClearedPkceCookies(url: string): NextResponse {
  const response = NextResponse.redirect(url)
  clearPkceCookies(response)

  return response
}

export async function GET(request: Request) {
  const cookieHandle = await cookies()
  const requestUrl = new URL(request.url)
  const cookieNames = getLinkIdentityCookieNames()

  const code = requestUrl.searchParams.get("code")
  const state = requestUrl.searchParams.get("state")
  const expectedState = cookieHandle.get(cookieNames.state)?.value
  const verifier = cookieHandle.get(cookieNames.verifier)?.value

  if (!code || !state || state !== expectedState) {
    return redirectWithClearedPkceCookies(`${env.NEXT_PUBLIC_ORIGIN}?error=invalid_link_state`)
  }

  if (!verifier) {
    return redirectWithClearedPkceCookies(`${env.NEXT_PUBLIC_ORIGIN}?error=missing_link_verifier`)
  }

  const tokenSet = await exchangeLinkIdentityCode({
    issuerUrl: env.AUTH0_ISSUER,
    clientId: env.AUTH0_CLIENT_ID,
    clientSecret: env.AUTH0_CLIENT_SECRET,
    redirectUri: `${env.NEXT_PUBLIC_ORIGIN}/api/auth/link-identity/callback`,
    code,
    verifier,
  })

  const secondaryUserId = decodeJwt(tokenSet.idToken).sub
  if (!secondaryUserId) {
    return redirectWithClearedPkceCookies(`${env.NEXT_PUBLIC_ORIGIN}?error=no_sub`)
  }

  const session = await getServerSession()
  if (!session) {
    return redirectWithClearedPkceCookies(new URL(createAuthorizeUrl(), env.NEXT_PUBLIC_ORIGIN).toString())
  }

  const response = NextResponse.redirect(`${env.NEXT_PUBLIC_ORIGIN}/innstillinger/bruker/link`)
  clearPkceCookies(response)
  applyPendingLinkCookies(response, tokenSet.idToken, secondaryUserId)

  return response
}
