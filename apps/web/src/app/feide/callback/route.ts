import { getFeideMembershipDocumentation, getFeideProfileInformation } from "@/utils/feide"
import { getServerClient } from "@/utils/trpc/serverClient"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { env } from "@dotkomonline/env"
import { getServerSession } from "next-auth"
import { type NextRequest, NextResponse } from "next/server"
import { Issuer } from "openid-client"
import { z } from "zod"

const GroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
})

const ProfileSchema = z.object({
  norEduPersonLegalName: z.string(),
  uid: z.array(z.string()),
  sn: z.array(z.string()).length(1),
  givenName: z.array(z.string()).length(1),
})

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

  const documentation = await getFeideMembershipDocumentation(tokenSet.access_token)
  const profile = await getFeideProfileInformation(tokenSet.access_token)

  let user = await trpc.user.getByAuth0Id(session.sub)

  if (user === null) {
    user = await trpc.user.create({
      auth0Id: session.sub,
      email: session.user.email,
      givenName: profile.givenName[0],
      familyName: profile.sn[0],
      gender: "male",
      name: profile.norEduPersonLegalName,
      phone: null,
      studyYear: -1,
      picture: null,
      allergies: [],
    })
  }

  await trpc.membershipApplication.create({
    userId: user.id,
    documentation,
    fieldOfStudy: "MASTER_SOFTWARE_ENGINEERING",
    classYear: 2022,
    status: "PENDING",
    preapproved: false,
    comment: "What the sigma",
  })

  return NextResponse.redirect(new URL("/onboarding", request.url).toString(), 302)
}
