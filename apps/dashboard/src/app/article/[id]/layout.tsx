"use client"
import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { ArticleDetailsContext } from "./provider"

import { useTRPC } from "@/trpc"
import { useQuery } from "@tanstack/react-query"

export default function ArticleDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const trpc = useTRPC()
  const { id } = use(params)
  const { data, isLoading } = useQuery(trpc.article.get.queryOptions(id))
  const value = useMemo(
    () =>
      !data || isLoading
        ? null
        : {
            article: data,
          },
    [data, isLoading]
  )

  if (value === null) {
    return <Loader />
  }

  return <ArticleDetailsContext.Provider value={value}>{children}</ArticleDetailsContext.Provider>
}
