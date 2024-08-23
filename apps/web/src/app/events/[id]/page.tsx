"use client"

import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Committee, Company, Event } from "@dotkomonline/types"
import type { Session } from "next-auth"
import { useSession } from "next-auth/react"
import type { FC } from "react"
import { AttendanceBox } from "../components/AttendanceBox/AttendanceBox"
import { EventHeader } from "../components/EventHeader"
import { EventInfoBox } from "../components/EventInfoBox"
import { OrganizerBox } from "../components/OrganizerBox"
import TicketButton from "../components/TicketButton"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"
import { useGetAttendee } from "../components/queries"

const EventDetailPage = ({ params: { id } }: { params: { id: string } }) => {
  return <EventDetailPageInner id={id} />
}

const EventDetailPageInner = ({ id }: { id: string }) => {
  const session = useSession()

  const { data: event, isLoading: eventIsLoading } = trpc.event.getWebEventDetailData.useQuery(id)

  if (eventIsLoading) {
    return <div>Laster</div>
  }

  if (!event) {
    return <div>Kunne ikke hente data</div>
  }

  if (event.hasAttendance) {
    return (
      <EventDetailWithAttendancePage
        user={session.data?.user}
        attendance={event.attendance}
        pools={event.pools}
        event={event.event}
        committees={event.eventCommittees}
        companies={event.eventCompanies}
      />
    )
  }

  return (
    <EventDetailWithoutAttendancePage
      user={session?.data?.user}
      event={event.event}
      committees={event.eventCommittees}
      companies={event.eventCompanies}
    />
  )
}

interface EventDetailProps {
  user: NonNullable<Session["user"]> | undefined
  event: Event
  committees: Committee[]
  companies: Company[]
}
const EventDetailWithoutAttendancePage: FC<EventDetailProps> = ({ user, event, committees, companies }) => {
  return (
    <div className="mt-8 flex flex-col gap-16">
      <EventHeader event={event} />
      <div className="flex w-full">
        <EventInfoBox event={event} committees={committees} companies={companies} />
      </div>
    </div>
  )
}

interface EventDetailWithAttendanceProps extends EventDetailProps {
  attendance: Attendance
  pools: AttendancePool[]
}

const EventDetailWithAttendancePage: FC<EventDetailWithAttendanceProps> = ({
  user,
  attendance,
  pools,
  event,
  committees,
  companies,
}) => {
  const { data: attendee } = useGetAttendee({
    attendanceId: attendance.id,
    userId: user?.id,
  })

  if (attendee === undefined) {
    return <div>Laster</div>
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <EventHeader event={event} />
      <div className="flex w-full flex-col md:flex-row">
        <EventInfoBox event={event} committees={committees} companies={companies} />
        <div className="flex-1 flex-col">
          <AttendanceBox sessionUser={user} attendance={attendance} pools={pools} event={event} attendee={attendee} />
          {attendee && user && <TicketButton userId={user.id} />}
          {committees.length && <OrganizerBox committees={committees} />}
          <TimeLocationBox
            datetimeStart={event.start}
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
