"use client"

import { Loader } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { useMarkGetQuery } from "../../../../modules/punishment/queries/use-mark-get-query"
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
