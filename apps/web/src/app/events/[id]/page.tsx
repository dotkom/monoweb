import { getServerClient } from "@/utils/trpc/serverClient"
import { getServerSession } from "next-auth"
import { AttendanceBox } from "../components/AttendanceBox/AttendanceBox"
import { EventHeader } from "../components/EventHeader"
import { EventInfoBox } from "../components/EventInfoBox"
import { OrganizerBox } from "../components/OrganizerBox"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"

const EventDetailPage = async ({ params: { id } }: { params: { id: string } }) => {
  const session = await getServerSession()
  const client = await getServerClient()

  const eventDetail = await client.event.getWebEventDetailData(id)

  const { event, eventCommittees: committees, eventCompanies: companies, hasAttendance } = eventDetail

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col md:flex-row">
        <EventInfoBox event={eventDetail.event} committees={committees} companies={companies} />
        <div className="flex-1 flex-col">
          {hasAttendance && (
            <AttendanceBox
              sessionUser={session?.user}
              attendance={eventDetail.attendance}
              pools={eventDetail.pools}
              event={event}
            />
          )}
          {committees.length ? <OrganizerBox committees={committees} /> : null}
          <TimeLocationBox
            datetimeStart={eventDetail.event.start}
            datetimeEnd={event.end}
            locationTitle={event.locationTitle}
            locationAddress={event.locationAddress}
            locationLink={event.locationLink}
            eventTitle={event.title}
            eventDescription={event.description}
          />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
