"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { UserDetailsContext } from "./provider"

export default function UserDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const id = decodeURIComponent(use(params).id)
  const { data, isLoading } = trpc.user.get.useQuery(id)
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
