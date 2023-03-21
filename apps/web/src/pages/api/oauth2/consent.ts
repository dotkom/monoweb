import { hydraAdmin } from "@/lib/hydra"
import { clerkClient, getAuth } from "@clerk/nextjs/server"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query
  const challenge = String(query["consent_challenge"])
  if (!challenge) {
    res.status(400).json({ error: "No consent challenge found in request." })
    return
  }

  const { data: consentBody } = await hydraAdmin.getOAuth2ConsentRequest(challenge)
  const { userId } = getAuth(req)

  // if (consentBody.skip && subject) {
  if (userId) {
    const grantScope = ["openid", "email", "profile"]
    const user = await clerkClient.users.getUser(userId)
    const { data: acceptConsent } = await hydraAdmin.acceptOAuth2ConsentRequest(consentBody.challenge, {
      grant_scope: grantScope,
      session: {
        id_token: {
          user,
        },
      },
    })
    res.redirect(acceptConsent.redirect_to)
  } else {
    res.redirect("/auth/consent?consent_challenge=" + challenge)
  }
}
