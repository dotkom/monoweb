import { auth } from "@/auth"
import { EventListWithFilters } from "./components/EventListWithFilters"

const EventPage = async () => {
  const session = await auth.getServerSession()

  return <EventListWithFilters userId={session?.sub} />
}

export default EventPage
