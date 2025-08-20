import type { NextApiRequest, NextApiResponse } from "next"
import { formSchema } from "../../app/form-schema"
import { deliverNotificationEmail } from "../../email"

// biome-ignore lint/style/noDefaultExport: this has to be migrated to app router
export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }
  const json = JSON.parse(req.body)
  const parseResult = formSchema.safeParse(json)
  if (!parseResult.success) {
    res.status(400).end()
    return
  }
  const body = parseResult.data
  const response = await deliverNotificationEmail(body)
  if (!response.ok) {
    console.error(response.status)
    res.status(response.status).send(await response.text())
    return
  }
  res.status(200).send("OK")
}
