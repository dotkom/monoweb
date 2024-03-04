"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { useAttendanceGetQuery } from "../../../../modules/attendance/queries/use-get-queries"
import { useEventGetQuery } from "../../../../modules/event/queries/use-event-get-query"
import { EventDetailsContext } from "./provider"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { event, eventCommittees, isLoading: eventCommitteesLoading } = useEventGetQuery(params.id)
  const { data: attendance, isLoading: attendanceLoading } = useAttendanceGetQuery(
    event?.attendanceId ?? "",
    Boolean(event)
  )

  return (
    <>
      {eventCommitteesLoading || attendanceLoading || !event || attendance === undefined ? (
        <Loader />
      ) : (
        <EventDetailsContext.Provider value={{ event, eventCommittees, attendance }}>
          {children}
        </EventDetailsContext.Provider>
      )}
    </>
  )
}
