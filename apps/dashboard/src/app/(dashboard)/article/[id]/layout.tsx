"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, use, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { ArticleDetailsContext } from "./provider"

export default function ArticleDetailsLayout({
  children,
  params,
}: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = use(params)
  const { data, isLoading } = trpc.article.get.useQuery(id)
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
