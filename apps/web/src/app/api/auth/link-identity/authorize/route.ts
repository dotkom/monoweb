import { auth, oauth2Service } from "@/auth"
import { env } from "@/env"
import { OAuthScopes } from "@dotkomonline/oauth2"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const isHttps = env.NEXT_PUBLIC_ORIGIN.startsWith("https://")
const cookiePrefix = isHttps ? "__Secure-" : ""

export async function GET(request: Request) {
  const session = await auth.getServerSession()
  if (!session) {
    return NextResponse.redirect(new URL(createAuthorizeUrl(), env.NEXT_PUBLIC_ORIGIN))
  }

  const searchParams = new URL(request.url).searchParams
  const { url, state, verifier } = await oauth2Service.createAuthorizeUrl({
    redirectUrl: `${env.NEXT_PUBLIC_ORIGIN}/api/auth/link-identity/callback`,
    scopes: [OAuthScopes.OpenID, OAuthScopes.Profile, OAuthScopes.Email],
    connection: searchParams.get("connection") ?? undefined,
  })

  const cookieHandle = await cookies()
  const cookieOptions = { path: "/", httpOnly: true, sameSite: "lax" as const, maxAge: 300, secure: isHttps }
  cookieHandle.set(`${cookiePrefix}monoweb-link-state`, state, cookieOptions)
  cookieHandle.set(`${cookiePrefix}monoweb-link-verifier`, verifier, cookieOptions)

  return NextResponse.redirect(url)
}
