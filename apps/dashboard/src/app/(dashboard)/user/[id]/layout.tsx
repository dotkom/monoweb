"use client"

import { type PropsWithChildren } from "react"
import { Loader } from "@mantine/core"
import { useUserGetQuery } from "src/modules/user/queries/use-user-get-query"
import { UserDetailsContext } from "./provider"

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
