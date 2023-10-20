"use client"

import { PropsWithChildren } from "react"
import { MarkDetailsContext } from "./provider"
import { Loader } from "@mantine/core"
import { useMarkGetQuery } from "src/modules/punishment/queries/use-mark-get-query"

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
