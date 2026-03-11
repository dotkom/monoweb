import { type NextRequest, NextResponse } from "next/server"

export async function GET(_: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ status: "ok" })
}
