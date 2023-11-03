"use client"

import { type PropsWithChildren } from "react"
import { Loader } from "@mantine/core"
import { useMarkGetQuery } from "src/modules/punishment/queries/use-mark-get-query"
import { MarkDetailsContext } from "./provider"

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
