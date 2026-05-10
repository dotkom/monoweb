"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use } from "react"
import { useContestWithContestantsQuery } from "../queries"
import { ContestContext } from "./provider"

export default function ContestLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = useContestWithContestantsQuery(id)

  if (data === undefined || isLoading) {
    return <Loader />
  }

  return (
    <ContestContext.Provider value={data}>
      {children}
    </ContestContext.Provider>
  )
}
