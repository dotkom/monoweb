import { type NextRequest, NextResponse } from "next/server"
import { deliverNotificationEmail } from "../../../email"
import { formSchema } from "../../form-schema"

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const json = await req.json()
  const parseResult = formSchema.safeParse(json)
  if (!parseResult.success) {
    return NextResponse.json({ message: "Failed to parse form" }, { status: 400 })
  }
  const body = parseResult.data
  const response = await deliverNotificationEmail(body)
  if (!response.ok) {
    console.debug("Failed to dispatch confirmation to bedkom:", await response.text())
    return NextResponse.json({ message: "Failed to dispatch notification email" }, { status: 500 })
  }
  return NextResponse.json({ message: "OK" }, { status: 200 })
}
