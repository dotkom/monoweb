import { EventsViewToggle } from "@/components/molecules/EventsViewToggle"
import { EventList } from "@/components/organisms/EventList"
import { server } from "@/utils/trpc/server"
import { Title } from "@dotkomonline/ui"

const EventPage = async () => {
  const eventDetails = await server.event.all.query()

  const attendanceEvents = eventDetails.map((eventDetail) => ({
    ...eventDetail.event,
    attendance: eventDetail.attendance || null,
  }))

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="font-semibold font-poppins text-3xl">
        Arrangementer
      </Title>

      <div className="flex flex-col gap-4">
        <EventsViewToggle active="list" />
        <EventList attendanceEvents={attendanceEvents} />
      </div>
    </div>
  )
}

export default EventPage
