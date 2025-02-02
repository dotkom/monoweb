"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { trpc } from "../../../../trpc"
import { ArticleDetailsContext } from "./provider"

export default async function ArticleDetailsLayout({ children, params }: PropsWithChildren<{ params: Promise<{ id: string }> }>) {
  const { id } = await params
  const { data, isLoading } = trpc.article.get.useQuery(id)
  const value = useMemo(
    () =>
      data === undefined || isLoading
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
