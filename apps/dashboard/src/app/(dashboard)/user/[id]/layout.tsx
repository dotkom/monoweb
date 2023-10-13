"use client"

import { PropsWithChildren } from "react"
import { UserDetailsContext } from "./provider"
import { Loader } from "@mantine/core"
import { useUserGetQuery } from "src/modules/user/queries/use-user-get-query"

export default function UserDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { user, isLoading } = useUserGetQuery(params.id)
  return (
    <>
      {isLoading || !user ? (
        <Loader />
      ) : (
        <UserDetailsContext.Provider value={{ user }}>{children}</UserDetailsContext.Provider>
      )}
    </>
  )
}
