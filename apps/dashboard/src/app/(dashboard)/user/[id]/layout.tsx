"use client"

import { Loader } from "@mantine/core"
import { PropsWithChildren, useMemo } from "react";
import { trpc } from "../../../../utils/trpc"
import { UserDetailsContext } from "./provider"

export default function UserDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const id = decodeURIComponent(params.id)
  const { data, isLoading } = trpc.user.get.useQuery(id)
  const value = useMemo(() => (data === undefined || isLoading) ? null : ({
    user: data
  }), [data, isLoading])

  if (value === null) {
    return <Loader />
  }

  return <UserDetailsContext.Provider value={value}>{children}</UserDetailsContext.Provider>
}
