import { type NextRequest, NextResponse } from "next/server"
import { deliverConfirmationEmail, deliverNotificationEmail } from "../../../email"
import { createSpreadsheetRow } from "../../../spreadsheet"
import { formSchema } from "../../form-schema"

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  const json = await req.json()
  const parseResult = formSchema.safeParse(json)
  if (!parseResult.success) {
    console.debug("Failed to parse form with JSON:", json)
    return NextResponse.json({ message: "Failed to parse form" }, { status: 400 })
  }
  const body = parseResult.data
  await createSpreadsheetRow(body)

  let response: Response = await deliverConfirmationEmail(body)
  if (!response.ok) {
    console.debug("Failed to dispatch confirmation to sender:", await response.text())
    return NextResponse.json({ message: "Failed to dispatch confirmation email" }, { status: 500 })
  }

  response = await deliverNotificationEmail(body)
  if (!response.ok) {
    console.debug("Failed to dispatch notifcation to sender:", await response.text())
    return NextResponse.json({ message: "Failed to dispatch notification email" }, { status: 500 })
  }
  return NextResponse.json({ message: "OK" }, { status: 200 })
}
