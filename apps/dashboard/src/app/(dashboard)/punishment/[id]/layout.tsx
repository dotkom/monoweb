"use client"

import { Loader } from "@mantine/core"
import { use, type PropsWithChildren } from "react"
import { useMarkGetQuery } from "../../../../modules/punishment/queries/use-mark-get-query"
import { MarkDetailsContext } from "./provider"

export default function MarkDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
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
