import EventsViewToggle from "@/components/molecules/EventsViewToggle"
import { EventList } from "@/components/organisms/EventList"
import { server } from "@/utils/trpc/server"

const EventPage = async () => {
  const events = await server.event.all.query({ page: { take: 50 } })

  return (
    <>
      <h1 className="py-6">Arrangement</h1>
      <EventsViewToggle active="list" />
      <EventList events={events} />
    </>
  )
}

export default EventPage
