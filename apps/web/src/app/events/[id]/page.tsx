import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { AttendanceCard } from "../components/AttendanceCard/AttendanceCard"
import { EventDescriptionAndByline } from "../components/EventDescriptionAndByline"
import { EventHeader } from "../components/EventHeader"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"

const EventDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await auth()
  const eventDetail = await server.event.getWebEventDetailData.query(id)

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col md:flex-row">
        <EventDescriptionAndByline
          event={eventDetail.event}
          groups={eventDetail.eventHostingGroups}
          companies={eventDetail.eventCompanies}
        />
        <div className="flex-1 flex-col">
          {eventDetail.hasAttendance && <AttendanceCard sessionUser={session?.user} initialEventDetail={eventDetail} />}
          <TimeLocationBox event={eventDetail.event} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
