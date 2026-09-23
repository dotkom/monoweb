"use client"

import { Text } from "@dotkomonline/ui"
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
    return <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
  }

  if (isError || notification === undefined) {
    return <Text>Fant ikke varslingen</Text>
  }

  return <NotificationDetailsContext.Provider value={{ notification }}>{children}</NotificationDetailsContext.Provider>
}
