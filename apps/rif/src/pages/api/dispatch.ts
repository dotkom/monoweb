import type { NextApiRequest, NextApiResponse } from "next"
import { formSchema } from "../../app/form-schema"
import { deliverConfirmationEmail, deliverNotificationEmail } from "../../email"
import { createSpreadsheetRow } from "../../spreadsheet"

export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405)
  }
  const json = JSON.parse(req.body)
  const parseResult = formSchema.safeParse(json)
  if (!parseResult.success) {
    console.debug("Failed to parse form with JSON:", json)
    return res.status(400)
  }
  const body = parseResult.data
  await createSpreadsheetRow(body)

  let response: Response = await deliverConfirmationEmail(body)
  if (!response.ok) {
    console.debug("Failed to dispatch confirmation to sender:", await response.text())
    return res.status(500).send({ message: "Failed to dispatch confirmation email" })
  }

  response = await deliverNotificationEmail(body)
  if (!response.ok) {
    console.debug("Failed to dispatch notifcation to sender:", await response.text())
    return res.status(500).send({ message: "Failed to dispatch notification email" })
  }
  res.status(200).send("OK")
}
