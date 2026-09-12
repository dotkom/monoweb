"use client"

import { Loader, Text } from "@mantine/core"
import { type PropsWithChildren, use } from "react"
import { useNotificationGetQuery } from "../queries"
import { NotificationDetailsContext } from "./provider"

export default function NotificationDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data: notification, isLoading, isError } = useNotificationGetQuery(id)

  if (isLoading) {
    return <Loader />
  }

  if (isError || notification === undefined) {
    return <Text>Fant ikke varslingen</Text>
  }

  return <NotificationDetailsContext.Provider value={{ notification }}>{children}</NotificationDetailsContext.Provider>
}
