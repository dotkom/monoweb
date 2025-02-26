"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { useEventDetailsGetQuery } from "../../../../modules/event/queries/use-event-get-query"
import { EventDetailsContext } from "./provider"

export default function EventDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = useEventDetailsGetQuery(id)
  const value = useMemo(
    () =>
      data === undefined || isLoading
        ? null
        : {
            event: data.event,
            eventHostingGroups: data.eventHostingGroups,
            attendance: data.attendance,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <EventDetailsContext.Provider value={value}>{children}</EventDetailsContext.Provider>
}
