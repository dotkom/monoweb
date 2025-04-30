"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use } from "react"
import { useEventDetailsGetQuery } from "../queries"
import { EventDetailsContext } from "./provider"

export default function EventDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = useEventDetailsGetQuery(id)

  if (data === undefined) {
    return <Loader />
  }

  return <EventDetailsContext.Provider value={data}>{children}</EventDetailsContext.Provider>
}
