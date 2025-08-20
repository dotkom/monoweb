import type { NextApiRequest, NextApiResponse } from "next"
import { formSchema } from "../../app/form-schema"
import { deliverConfirmationEmail, deliverNotificationEmail } from "../../email"
import { createSpreadsheetRow } from "../../spreadsheet"

// biome-ignore lint/style/noDefaultExport: this has to be migrated to app router
export default async function Route(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end()
    return
  }
  const json = JSON.parse(req.body)
  const parseResult = formSchema.safeParse(json)
  if (!parseResult.success) {
    console.debug("Failed to parse form with JSON:", json)
    res.status(400).end()
    return
  }
  const body = parseResult.data
  await createSpreadsheetRow(body)

  let response: Response = await deliverConfirmationEmail(body)
  if (!response.ok) {
    console.debug("Failed to dispatch confirmation to sender:", await response.text())
    res.status(500).send({ message: "Failed to dispatch confirmation email" })
    return
  }

  response = await deliverNotificationEmail(body)
  if (!response.ok) {
    console.debug("Failed to dispatch notifcation to sender:", await response.text())
    res.status(500).send({ message: "Failed to dispatch notification email" })
    return
  }
  res.status(200).send("OK")
}
