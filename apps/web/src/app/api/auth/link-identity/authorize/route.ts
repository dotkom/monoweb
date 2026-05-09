import { getServerSession } from "@/auth"
import { env } from "@/env"
import { createLinkIdentityAuthorizeUrl } from "@/lib/link-identity-oauth"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const isHttps = env.NEXT_PUBLIC_ORIGIN.startsWith("https://")
const cookiePrefix = isHttps ? "__Secure-" : ""

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

  const cookieHandle = await cookies()
  const cookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 300,
    secure: isHttps,
  }
  cookieHandle.set(`${cookiePrefix}monoweb-link-state`, state, cookieOptions)
  cookieHandle.set(`${cookiePrefix}monoweb-link-verifier`, verifier, cookieOptions)

  return NextResponse.redirect(url)
}
