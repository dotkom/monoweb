"use client"

import { Loader } from "@mantine/core"
import { type PropsWithChildren } from "react"
import { ArticleDetailsContext } from "./provider"
import { trpc } from "../../../../utils/trpc"

export default function ArticleDetailsLayout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
  const { data, isLoading } = trpc.article.get.useQuery(params.id)
  return (
    <>
      {isLoading || !data ? (
        <Loader />
      ) : (
        <ArticleDetailsContext.Provider value={{ article: data }}>{children}</ArticleDetailsContext.Provider>
      )}
    </>
  )
}
