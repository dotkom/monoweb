import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { server } from "@/utils/trpc/server"
import { getServerSession } from "next-auth"
import { AttendanceCard } from "../components/AttendanceCard/AttendanceCard"
import { EventDescriptionAndByline } from "../components/EventDescriptionAndByline"
import { EventHeader } from "../components/EventHeader"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"

const EventDetailPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params
  const session = await getServerSession(authOptions)
  const { event, attendance, committees, companies } = await server.event.getAttendanceEvent.query(eventId)

  const attendee =
    session && attendance
      ? await server.attendance.getAttendee.query({ attendanceId: attendance.id, userId: session.user.id })
      : null

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={event} />
      <div className="flex w-full flex-col md:flex-row">
        <EventDescriptionAndByline event={event} committees={committees} companies={companies} />
        <div className="flex-1 flex-col">
          {attendance !== null && <AttendanceCard attendance={attendance} user={session?.user} attendee={attendee} />}

          <TimeLocationBox event={event} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
