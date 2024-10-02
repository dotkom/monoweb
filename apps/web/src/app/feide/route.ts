import { env } from "@dotkomonline/env"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
  const params = new URLSearchParams()

  params.append("client_id", env.DATAPORTEN_CLIENT_ID)
  params.append("response_type", "code")
  params.append("scope", "openid userid-feide userid-name profile groups email")
  params.append("redirect_uri", "http://localhost:3000/feide/callback")

  redirect(`https://auth.dataporten.no/oauth/authorization?${params.toString()}`)
}
