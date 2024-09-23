import type { NextApiRequest, NextApiResponse } from "next"
import { formSchema } from "../../app/form-schema"
import { deliverConfirmationEmail, deliverNotificationEmail } from "../../email"

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

  await createSpreadsheetRow(body)

  let response: Response = await deliverConfirmationEmail(body)
  const data = await response.text()

  if (!response.ok) {
    return res.status(response.status).send(data)
  }

  response = await deliverNotificationEmail(body)
  if (!response.ok) {
    return res.status(response.status).send(data)
  }

  res.status(200).send("OK")
}
