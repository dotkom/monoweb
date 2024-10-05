import { EventList } from "@/components/organisms/EventList"
import { server } from "@/utils/trpc/server"

const EventPage = async () => {
  const events = await server.event.all.query()
  return <EventList title="Arrangementer" events={events} />
}

export default EventPage
