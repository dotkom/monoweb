import { NextApiRequest, NextApiResponse } from "next"

import { WebhookEvent } from "@clerk/backend"
import { createContextInner } from "../context"

export async function clerkHandler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await createContextInner({ auth: null })
  const event: WebhookEvent = req.body
  switch (event.type) {
    case "user.created": {
      const user = await ctx.userService.createUser(event.data.id)
      res.status(200).send(`User(${user.id}) has been created.`)
      break
    }
  }
}
