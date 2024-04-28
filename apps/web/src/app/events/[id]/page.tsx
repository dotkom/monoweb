"use client"

import { trpc } from "@/utils/trpc/client"
import type { Attendance, AttendancePool, Committee, Event } from "@dotkomonline/types"
import type { Session } from "next-auth"
import { useSession } from "next-auth/react"
import type { FC } from "react"
import { AttendanceBox } from "../components/AttendanceBox"
import { EventInfoBox } from "../components/EventInfoBox"
import { OrganizerBox } from "../components/OrganizerBox"
import TicketButton from "../components/TicketButton"
import { TimeLocationBox } from "../components/TimeLocationBox/TimeLocationBox"
import { useGetAttendee } from "../components/queries"

const EventDetailPage = ({ params: { id } }: { params: { id: string } }) => {
  return <EventDetailPageInner id={id} />
}

const EventDetailPageInner = ({ id }: { id: string }) => {
  "use client"

  const session = useSession()

  const { data: event, isLoading: eventIsLoading } = trpc.event.getWebEventDetailData.useQuery(id)

  if (eventIsLoading) {
    return <div>Laster</div>
  }

  if (!event || !session?.data) {
    return <div>Kunne ikke hente data</div>
  }

  if (event.hasAttendance) {
    return (
      <EventDetailWithAttendancePage
        user={session.data.user}
        attendance={event.attendance}
        pools={event.pools}
        event={event.event}
        committees={event.eventCommittees}
      />
    )
  }

  return (
    <EventDetailWithoutAttendancePage user={session.data.user} event={event.event} committees={event.eventCommittees} />
  )
}

interface WithoutAttendanceProps {
  user: NonNullable<Session["user"]>
  event: Event
  committees: Committee[]
}
const EventDetailWithoutAttendancePage: FC<WithoutAttendanceProps> = ({ user, event, committees }) => {
  return (
    <div>
      <div className="flex w-full">
        <EventInfoBox event={event} />
      </div>
    </div>
  )
}

interface WithAttendanceProps {
  user: NonNullable<Session["user"]>
  attendance: Attendance
  pools: AttendancePool[]
  event: Event
  committees: Committee[]
}

const EventDetailWithAttendancePage: FC<WithAttendanceProps> = ({ user, attendance, pools, event, committees }) => {
  const { data: attendee } = useGetAttendee({
    attendanceId: attendance.id,
    userId: user.id,
  })

  return (
    <div>
      <div className="flex w-full">
        <EventInfoBox event={event} />
        <div className="flex flex-1 flex-col">
          <AttendanceBox sessionUser={user} attendance={attendance} pools={pools} event={event} />
          {attendee && <TicketButton userid={user.id} />}
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
