"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren, useMemo } from "react"
import { trpc } from "../../../../utils/trpc"
import { ArticleDetailsContext } from "./provider"

export default function ArticleDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.article.get.useQuery(params.id)
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
