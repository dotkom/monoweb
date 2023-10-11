"use client"

import { type PropsWithChildren } from "react"
import { Loader } from "@mantine/core"
import { EventDetailsContext } from "./provider"
import { useEventGetQuery } from "../../../../modules/event/queries/use-event-get-query"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { event, isLoading } = useEventGetQuery(params.id)
  return (
    <>
      {isLoading || !event ? (
        <Loader />
      ) : (
        <EventDetailsContext.Provider value={{ event }}>{children}</EventDetailsContext.Provider>
      )}
    </>
  )
}
