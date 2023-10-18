"use client"

import { Loader } from "@mantine/core"
import { PropsWithChildren } from "react"
import { useEventGetQuery } from "../../../../modules/event/queries/use-event-get-query"
import { EventDetailsContext } from "./provider"

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
