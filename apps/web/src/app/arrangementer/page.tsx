import { cookies } from "next/headers"
import { EventListPage } from "./EventListPage"
import { EVENT_VIEW_COOKIE_NAME, parseEventsListViewMode } from "./hooks/eventViewCookie"

const EventsPage = async () => {
  const cookieStore = await cookies()
  const initialListViewMode = parseEventsListViewMode(cookieStore.get(EVENT_VIEW_COOKIE_NAME)?.value)

  return <EventListPage initialListViewMode={initialListViewMode} />
}

export default EventsPage
