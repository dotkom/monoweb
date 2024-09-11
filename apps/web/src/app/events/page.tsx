import { EventList } from "@/components/organisms/EventList"
import { getServerClient } from "@/utils/trpc/serverClient"

const EventPage = async () => {
  const serverClient = await getServerClient()
  const events = await serverClient.event.all({take: 50})
  return <EventList title="Arrangementer" events={events} />
}

export default EventPage
