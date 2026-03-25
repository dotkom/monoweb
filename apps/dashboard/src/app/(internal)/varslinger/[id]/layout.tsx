"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { NotificationDetailsContext } from "./provider"

import { useTRPC } from "@/lib/trpc-client"
import { useQuery } from "@tanstack/react-query"

export default function NotificationDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.notification.get.queryOptions(id))
  const value = useMemo(
    () =>
      !data || isLoading
        ? null
        : {
            notification: data,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <NotificationDetailsContext.Provider value={value}>{children}</NotificationDetailsContext.Provider>
}
