import type { NextApiRequest, NextApiResponse } from "next"
import { formSchema } from "../../app/form-schema"
import { deliverNotificationEmail } from "../../email"

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405)
  }
  const json = JSON.parse(req.body)
  const parseResult = formSchema.safeParse(json)
  if (!parseResult.success) {
    return res.status(400)
  }
  const body = parseResult.data
  const response = await deliverNotificationEmail(body)
  if (!response.ok) {
    console.error(response.status)
    return res.status(response.status).send(await response.text())
  }
  res.status(200).send("OK")
}
