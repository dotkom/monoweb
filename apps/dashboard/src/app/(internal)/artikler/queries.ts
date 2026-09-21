import { useTRPC } from "@/lib/trpc-client"
import type { ArticleFilterQuery } from "@dotkomonline/rpc/article"
import type { Pageable } from "@dotkomonline/utils"
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useArticleBySlugQuery = (slug: string) => {
  const trpc = useTRPC()
  return useQuery({
    ...trpc.article.getBySlug.queryOptions(slug),
  })
}

export const useArticleAllInfiniteQuery = ({ filter, page }: { filter: ArticleFilterQuery; page?: Pageable }) => {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.article.findArticles.infiniteQueryOptions({
      filters: filter,
      ...page,
    }),
    select: (data) => data.pages.flatMap((page) => page.items),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  })

  const articles = useMemo(() => data ?? [], [data])

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
