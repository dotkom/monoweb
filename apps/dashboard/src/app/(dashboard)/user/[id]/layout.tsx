"use client"

import { Loader } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { trpc } from "../../../../utils/trpc"
import { UserDetailsContext } from "./provider"

export default function UserDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const id = decodeURIComponent(params.id)
  const { data, isLoading, error } = trpc.user.get.useQuery(id)

  if (error) {
    console.log(error)
    return <div>{error.message}</div>
  }

  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <UserDetailsContext.Provider value={{ user: data }}>{children}</UserDetailsContext.Provider>
      )}
    </>
  )
}
