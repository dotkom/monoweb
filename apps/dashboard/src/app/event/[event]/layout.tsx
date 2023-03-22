"use client"

import { PropsWithChildren } from "react"
import { EventDetailsContext } from "./provider"
import { trpc } from "../../../trpc"
import { Loader } from "@mantine/core"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { event: string } }>) {
  const { data, isLoading } = trpc.event.get.useQuery(params.event)
  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <EventDetailsContext.Provider value={{ event: data }}>{children}</EventDetailsContext.Provider>
      )}
    </>
  )
}
