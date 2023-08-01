import { NextApiRequest, NextApiResponse } from "next"

import { WebhookEvent } from "@clerk/backend"
import { createServiceLayer } from "@dotkomonline/ow-core"
import { kysely } from "@dotkomonline/db"

export async function clerkHandler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await createServiceLayer(kysely)
  const event: WebhookEvent = req.body
  switch (event.type) {
    case "user.created": {
      const user = await ctx.userService.createUser(event.data.id)
      res.status(200).send(`User(${user.id}) has been created.`)
      break
    }
  }
}
