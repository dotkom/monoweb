"use client"
import { useTRPC } from "@/trpc"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { UserDetailsContext } from "./provider"

import { useQuery } from "@tanstack/react-query"

export default function UserDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const id = decodeURIComponent(use(params).id)
  const { data, isLoading } = useQuery(trpc.user.get.queryOptions(id))
  const value = useMemo(
    () =>
      data === undefined || isLoading
        ? null
        : {
            user: data,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  const u = value.user
  if (u === null) {
    return <div>User {id} not found</div>
  }

  return <UserDetailsContext.Provider value={{ user: u }}>{children}</UserDetailsContext.Provider>
}
