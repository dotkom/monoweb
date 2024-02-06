"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { EventDetailsContext } from "./provider"
import { useEventGetQuery } from "../../../../modules/event/queries/use-event-get-query"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { event, eventCommittees, isLoading } = useEventGetQuery(params.id)
  return (
    <>
      {isLoading || !event ? (
        <Loader />
      ) : (
        <EventDetailsContext.Provider value={{ event, eventCommittees }}>{children}</EventDetailsContext.Provider>
      )}
    </>
  )
}
