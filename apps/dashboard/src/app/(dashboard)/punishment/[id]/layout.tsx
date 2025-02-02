"use client"

import { Loader } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { useMarkGetQuery } from "../../../../modules/punishment/queries/use-mark-get-query"
import { MarkDetailsContext } from "./provider"

export default async function MarkDetailsLayout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = await params
  const { mark, isLoading } = useMarkGetQuery(id)
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
