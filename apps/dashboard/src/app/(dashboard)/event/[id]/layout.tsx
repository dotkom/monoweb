"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { useEventDetailsGetQuery } from "../../../../modules/event/queries/use-event-get-query"
import { EventDetailsContext } from "./provider"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = useEventDetailsGetQuery(params.id)
  const value = useMemo(
    () =>
      data === undefined || isLoading
        ? null
        : {
            event: data.event,
            eventCommittees: data.eventCommittees,
            attendance: data.attendance,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <EventDetailsContext.Provider value={value}>{children}</EventDetailsContext.Provider>
}
