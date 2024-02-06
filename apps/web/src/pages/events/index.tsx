import { EventList } from "@/components/organisms/EventList"
import { trpc } from "@/utils/trpc"

const EventPage = () => {
  const { data: events, isLoading } = trpc.event.all.useQuery()
  if (isLoading) {
    return <div>Loading...</div>
  }
  return <EventList title="Arrangementer" isLoading={isLoading} events={events} />
}

export default EventPage
