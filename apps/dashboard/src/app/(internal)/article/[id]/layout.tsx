"use client"
import { Loader } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { type PropsWithChildren, use, useMemo } from "react"

import { useTRPC } from "@/lib/trpc-client"
import { ArticleDetailsContext } from "./provider"

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
