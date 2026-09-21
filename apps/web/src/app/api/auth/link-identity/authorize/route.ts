import { getServerSession } from "@/auth"
import { env } from "@/env"
import { applyPkceCookies } from "@/lib/link-identity-cookies"
import { createLinkIdentityAuthorizeUrl } from "@/lib/link-identity-oauth"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.redirect(new URL(createAuthorizeUrl(), env.NEXT_PUBLIC_ORIGIN))
  }

  const searchParams = new URL(request.url).searchParams
  const { url, state, verifier } = await createLinkIdentityAuthorizeUrl({
    issuerUrl: env.AUTH0_ISSUER,
    clientId: env.AUTH0_CLIENT_ID,
    redirectUrl: `${env.NEXT_PUBLIC_ORIGIN}/api/auth/link-identity/callback`,
    scopes: ["openid", "profile", "email"],
    connection: searchParams.get("connection") ?? undefined,
  })

  const response = NextResponse.redirect(url)
  applyPkceCookies(response, state, verifier)

  return response
}
