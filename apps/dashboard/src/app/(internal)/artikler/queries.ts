import { useTRPC } from "@/lib/trpc-client"
import { useQuery } from "@tanstack/react-query"

export const useArticleAllQuery = () => {
  const trpc = useTRPC()
  const { data: articles, ...query } = useQuery({
    ...trpc.article.all.queryOptions({ take: 999 }),
    initialData: [],
  })

  return { articles, ...query }
}

export const useTagsAllQuery = () => {
  const trpc = useTRPC()
  const { data: tags, ...query } = useQuery({
    ...trpc.article.getTags.queryOptions(),
    initialData: [],
  })

  return { tags, ...query }
}
