import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import type { Company, Group, GroupType, InterestGroup } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { AttendanceCard } from "../../components/AttendanceCard/AttendanceCard"
import { EventDescription } from "../../components/EventDescription"
import { EventHeader } from "../../components/EventHeader"
import { TimeLocationBox } from "../../components/TimeLocationBox/TimeLocationBox"

type OrganizerType = GroupType | "INTERESTGROUP" | "COMPANY"

const organizerTypeToLink: Record<OrganizerType, string> = {
  COMMITTEE: "/komiteer",
  INTERESTGROUP: "/interessegrupper",
  COMPANY: "/karriere",
  NODECOMMITTEE: "/nodekomiteer",
  OTHERGROUP: "/andre-grupper",
}

const mapToImageAndName = (item: Group | Company | InterestGroup, type: OrganizerType) => (
  <Link
    href={`${organizerTypeToLink[type]}/${item.id}`}
    key={item.name}
    className="flex flex-row gap-2 items-center px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-950"
  >
    {item.image && (
      <Image
        src={item.image}
        alt={item.name}
        width={22}
        height={22}
        className={clsx((type === "COMMITTEE" || type === "NODECOMMITTEE") && "dark:invert")}
      />
    )}
    <Text>{item.name}</Text>
  </Link>
)

const EventDetailPage = async ({ params }: { params: Promise<{ eventId: string }> }) => {
  const { eventId } = await params
  const session = await auth.getServerSession()
  const user = session ? await server.user.getMe.query() : undefined
  const eventDetail = await server.event.getEventDetail.query(eventId)
  const attendees = eventDetail.attendance
    ? await server.attendance.getAttendees.query({
        attendanceId: eventDetail.attendance.id,
      })
    : []

  const hostingGroups = eventDetail.hostingGroups.map((group) => mapToImageAndName(group, group.type))
  const hostingInterestGroups = eventDetail.hostingInterestGroups.map((interestGroup) =>
    mapToImageAndName(interestGroup, "INTERESTGROUP")
  )
  const companyList = eventDetail.hostingCompanies.map((company) => mapToImageAndName(company, "COMPANY"))
  const organizers = [...companyList, ...hostingGroups, ...hostingInterestGroups]

  return (
    <div className="flex flex-col gap-8">
      <EventHeader event={eventDetail.event} />
      <div className="flex w-full flex-col gap-8 md:flex-row">
        <div className="w-full flex flex-col gap-4 px-2 md:px-0 md:w-[60%]">
          {organizers.length > 0 ? (
            <div className="flex flex-row gap-2">{organizers}</div>
          ) : (
            <Text className="text-slate-900">Ingen arrangører</Text>
          )}
          {eventDetail.event.description && <EventDescription description={eventDetail.event.description} />}
        </div>

        <div className="flex flex-1 flex-col gap-8 sm:gap-4">
          <div className="sm:hidden h-1 rounded-full w-full bg-slate-200" />

          {eventDetail.attendance !== null && (
            <AttendanceCard initialAttendance={eventDetail.attendance} initialAttendees={attendees} user={user} />
          )}

          <div className="sm:hidden h-1 rounded-full w-full bg-slate-200" />

          <TimeLocationBox event={eventDetail.event} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
