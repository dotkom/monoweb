import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import type { Company, InterestGroup } from "@dotkomonline/types"
import type { Group } from "@dotkomonline/types"
import Image from "next/image"
import Link from "next/link"
import { AttendanceCard } from "../components/AttendanceCard/AttendanceCard"
import { EventDescription } from "../components/EventDescription"
import { EventHeader } from "../components/EventHeader"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"
import { Text } from "@dotkomonline/ui"

const mapToImageAndName = (item: Group | Company | InterestGroup) => (
  // TODO: Href link to all events by committee or company
  <Link href="/" key={item.name} className="flex flex-row gap-2 items-center px-3 py-2 rounded-lg hover:bg-slate-2">
    {item.image && <Image src={item.image} alt={item.name} width={22} height={22} />}
    <Text>{item.name}</Text>
  </Link>
)

const EventDetailPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params
  const session = await auth.getServerSession()
  const user = session ? await server.user.getMe.query() : undefined
  const eventDetail = await server.event.getAttendanceEventDetail.query(eventId)
  const attendee =
    eventDetail.attendance && session?.sub != null
      ? await server.attendance.getAttendee.query({
          attendanceId: eventDetail.attendance.id,
          userId: session.sub,
        })
      : null

  const hostingGroups = eventDetail.eventHostingGroups.map(mapToImageAndName)
  const hostingInterestGroups = eventDetail.eventInterestGroups.map(mapToImageAndName)
  const companyList = eventDetail.companies.map(mapToImageAndName)
  const organizers = [...companyList, ...hostingGroups, ...hostingInterestGroups]

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col md:flex-row">
        <section className="mr-10 w-full flex flex-col space-y-4 md:w-[60%]">
          {organizers.length > 0 ? (
            <div className="flex flex-row space-x-1">{organizers}</div>
          ) : (
            <Text>Ingen organiserere</Text>
          )}
          <EventDescription description={eventDetail.event.description ?? ""} />
        </section>
        <div className="flex-1 flex-col">
          {eventDetail.attendance !== null && session !== null && (
            <AttendanceCard initialAttendance={eventDetail.attendance} initialAttendee={attendee} user={user} />
          )}
          <TimeLocationBox event={eventDetail.event} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
