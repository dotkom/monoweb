import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useArticleAllQuery = () => {
  const trpc = useTRPC()
  const { data: articles = [], ...query } = useQuery(trpc.article.all.queryOptions({ take: 999 }))
  return { articles, ...query }
}
