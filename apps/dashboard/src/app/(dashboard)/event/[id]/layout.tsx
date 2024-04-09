"use client"

import { Loader } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { useEventDetailsGetQuery } from "../../../../modules/event/queries/use-event-get-query"
import { EventDetailsContext } from "./provider"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading: eventLoading } = useEventDetailsGetQuery(params.id)

  console.log(eventLoading, data)

  return (
    <>
      {eventLoading || data === undefined ? (
        <Loader />
      ) : (
        <EventDetailsContext.Provider
          value={{
            event: data.event,
            eventCommittees: data.eventCommittees,
            attendance: data.attendance,
          }}
        >
          {children}
        </EventDetailsContext.Provider>
      )}
    </>
  )
}
