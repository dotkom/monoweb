import { NextApiRequest, NextApiResponse } from "next"
import { getAuth } from "@clerk/nextjs/server"
import { hydraAdmin } from "@/lib/hydra"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query
  const challenge = String(query["login_challenge"])
  if (!challenge) {
    res.status(400).json({ error: "No login challenge found in request." })
    return
  }
  const { data: loginBody } = await hydraAdmin.getOAuth2LoginRequest({
    loginChallenge: challenge,
  })
  const { userId } = getAuth(req)

  if (loginBody.skip || userId) {
    const { data: acceptLogin } = await hydraAdmin.acceptOAuth2LoginRequest({
      loginChallenge: loginBody.challenge,
      acceptOAuth2LoginRequest: {
        subject: userId || loginBody.subject,
        // remember: true,
        // remember_for: 3600,
      },
    })
    res.redirect(acceptLogin.redirect_to)
  } else {
    res.redirect(`/sign-in?login_challenge=${challenge}`)
  }
}
