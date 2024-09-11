import { getServerClient } from "@/utils/trpc/serverClient"
import { getServerSession } from "next-auth"
import { AttendanceCard } from "../components/AttendanceCard/AttendanceCard"
import { EventDescriptionAndByline } from "../components/EventDescriptionAndByline"
import { EventHeader } from "../components/EventHeader"
import { OrganizerBox } from "../components/OrganizerBox"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"
import { web as authOptions } from "@dotkomonline/auth"

const EventDetailPage = async ({ params: { id } }: { params: { id: string } }) => {
  const [session, client] = await Promise.all([getServerSession(authOptions), getServerClient()])

  const eventDetail = await client.event.getWebEventDetailData(id)

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col md:flex-row">
        <EventDescriptionAndByline
            event={eventDetail.event}
            committees={eventDetail.eventCommittees}
            companies={eventDetail.eventCompanies} />
        <div className="flex-1 flex-col">
          {eventDetail.hasAttendance && (
            <AttendanceCard
              sessionUser={session?.user}
              initialEventDetail={eventDetail}
            />
          )}
          {
            eventDetail.eventCommittees.length ?
                <OrganizerBox committees={eventDetail.eventCommittees} /> : null
          }
          <TimeLocationBox
            datetimeStart={eventDetail.event.start}
            datetimeEnd={eventDetail.event.end}
            locationTitle={eventDetail.event.locationTitle}
            locationAddress={eventDetail.event.locationAddress}
            locationLink={eventDetail.event.locationLink}
            eventTitle={eventDetail.event.title}
            eventDescription={eventDetail.event.description}
          />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
