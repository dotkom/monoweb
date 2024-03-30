import { EventList } from "@/components/organisms/EventList"
import { getServerClient } from "@/utils/trpc/serverClient"

const EventPage = async () => {
  const serverClient = await getServerClient();
  const events = await serverClient.event.all();
  return <EventList title="Arrangementer" isLoading={false} events={events} />
}

export default EventPage
