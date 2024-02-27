"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { EventDetailsContext } from "./provider"
import { useEventGetQuery } from "../../../../modules/event/queries/use-event-get-query"
import { trpc } from "../../../../utils/trpc"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { event, eventCommittees, isLoading: eventCommitteesLoading } = useEventGetQuery(params.id)
  const { data: attendance, isLoading: attendanceLoading } = trpc.event.attendance.getAttendanceByEventId.useQuery(
    {
      eventId: event?.id ?? "",
    },
    {
      enabled: Boolean(event),
    }
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
