import { cookies } from "next/headers"
import { EventListPage } from "./EventListPage"
import { EVENT_VIEW_COOKIE_NAME, parseEventsListViewMode } from "./hooks/eventViewCookie"
import { server } from "@/utils/trpc/server"

const EventsPage = async () => {
  const cookieStore = await cookies()
  const initialListViewMode = parseEventsListViewMode(cookieStore.get(EVENT_VIEW_COOKIE_NAME)?.value)
  const groups = await server.group.all.query()

  return <EventListPage initialListViewMode={initialListViewMode} groups={groups} />
}

export default EventsPage
