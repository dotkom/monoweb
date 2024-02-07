"use client"

import { type PropsWithChildren } from "react"
import { Loader } from "@mantine/core"
import { MarkDetailsContext } from "./provider"
import { useMarkGetQuery } from "../../../../modules/punishment/queries/use-mark-get-query"

export default function MarkDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { mark, isLoading } = useMarkGetQuery(params.id)
  return (
    <>
      {isLoading || !mark ? (
        <Loader />
      ) : (
        <MarkDetailsContext.Provider value={{ mark }}>{children}</MarkDetailsContext.Provider>
      )}
    </>
  )
}
