import { createDocumentation, getFeideGroups, getFeideProfileInformation } from "@/utils/feide"
import { getServerClient } from "@/utils/trpc/serverClient"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { env } from "@dotkomonline/env"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"
import { Issuer } from "openid-client"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { FeideDocumentationSchema } from "@dotkomonline/types"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (session === null) {
    return Response.redirect("/", 302)
  }

  if (!session.user.email) {
    return new Response("Missing user email", { status: 400 })
  }

  const trpc = await getServerClient()

  const code = new URL(request.url).searchParams.get("code")

  if (code === null) {
    return new Response("Missing code", { status: 400 })
  }

  const issuer = await Issuer.discover("https://auth.dataporten.no")
  const client = new issuer.Client({
    client_id: env.DATAPORTEN_CLIENT_ID,
    client_secret: env.DATAPORTEN_CLIENT_SECRET,
    redirect_uris: ["http://localhost:3000/feide/callback"],
  })

  const tokenSet = await client.grant({
    code,
    redirect_uri: "http://localhost:3000/feide/callback",
    grant_type: "authorization_code",
  })

  if (!tokenSet || !tokenSet.access_token) {
    return new Response("Failed to get token", { status: 500 })
  }

  const membershipDocumentation = await createDocumentation(
    await getFeideGroups(tokenSet.access_token),
    await getFeideProfileInformation(tokenSet.access_token)
  )
  const user = await trpc.user.getByAuth0Id(session.sub)
  const userExists = Boolean(user)

  const response = NextResponse.redirect(
    new URL(userExists ? "/settings" : "/onboarding", request.url).toString(),
    {
      status: 302,
    }
  )

  response.cookies.set("feideDocumentationJWT", jwt.sign(membershipDocumentation, env.NEXTAUTH_SECRET), {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24)
  })

  return response
}
