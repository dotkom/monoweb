"use client"

import { PropsWithChildren } from "react"
import { EventDetailsContext } from "./provider"
import { trpc } from "../../../../utils/trpc"
import { Loader } from "@mantine/core"

export default function EventDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.event.get.useQuery(params.id)
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
