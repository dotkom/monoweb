"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { useEventDetailsGetQuery } from "../../../../modules/event/queries/use-event-get-query"
import { EventDetailsContext } from "./provider"

export default async function EventDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = await params
  const { data, isLoading } = useEventDetailsGetQuery(id)
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
