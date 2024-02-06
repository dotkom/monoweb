"use client"

import { type PropsWithChildren } from "react"
import { Loader } from "@mantine/core"
import { UserDetailsContext } from "./provider"
import { useUserGetQuery } from "../../../../modules/user/queries/use-user-get-query"

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
