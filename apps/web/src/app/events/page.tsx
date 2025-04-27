import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import { EventList } from "@/components/organisms/EventList"
import { server } from "@/utils/trpc/server"
import { Title } from "@dotkomonline/ui"

const EventPage = async () => {
  const events = await server.event.all.query()

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="font-semibold font-poppins text-3xl">
        Arrangementer
      </Title>

      <div className="flex flex-col gap-4">
        <EventsViewToggle active="list" />
        <EventList events={events.map(({ event }) => event)} />
      </div>
    </div>
  )
}

export default EventPage
