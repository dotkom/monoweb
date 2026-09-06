import { createPersonalCalendarFeedResponse } from "@/app/api/calendar/personal-feed"
import type { NextRequest, NextResponse } from "next/server"

type PersonalCalendarRouteContext = {
  params: Promise<{
    token: string
  }>
}

export async function GET(_: NextRequest, context: PersonalCalendarRouteContext): Promise<NextResponse> {
  const { token } = await context.params

  return createPersonalCalendarFeedResponse(token)
}
