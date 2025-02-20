import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { server } from "@/utils/trpc/server"
import { getServerSession } from "next-auth"
import { AttendanceCard } from "../components/AttendanceCard/AttendanceCard"
import { EventDescriptionAndByline } from "../components/EventDescriptionAndByline"
import { EventHeader } from "../components/EventHeader"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"

const EventDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const eventDetail = await server.event.getAttendanceEventDetail.query(id)

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col md:flex-row">
        <EventDescriptionAndByline
          event={eventDetail.event}
          committees={eventDetail.committees}
          companies={eventDetail.companies}
        />
        <div className="flex-1 flex-col">
          {eventDetail.attendance !== null && (
            <AttendanceCard sessionUser={session?.user} initialEventDetail={eventDetail} />
          )}
          <TimeLocationBox event={eventDetail.event} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
