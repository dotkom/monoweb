import type { ArticleFilterQuery } from "@dotkomonline/rpc/article"
import { useArticlesInfiniteQuery } from "../queries"
import { ArticleListItem } from "./ArticleListItem"
import { useState } from "react"
import { LoadMoreSentinel } from "src/components/molecules/LoadMoreSentinel/LoadMoreSentinel"

interface ArticleListProps {
  query: ArticleFilterQuery
}

export const ArticleList = ({ query }: ArticleListProps) => {
  const [scrollRoot] = useState<HTMLDivElement | null>(null)
  const { articles, fetchNextPage, isLoading, isFetchingNextPage, isPlaceholderData, hasNextPage } =
    useArticlesInfiniteQuery(query)

  return (
    <>
      <section className="flex w-full min-w-0 flex-col md:gap-2 sm:gap-6">
        <div className="grid w-full min-w-0 grid-cols-1 gap-2 md:grid-cols-3 sm:hidden">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} className="h-full min-w-0" orientation="vertical" />
          ))}
        </div>
        <div className="hidden flex-col gap-2 sm:flex">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} className="h-full min-w-0" orientation="horizontal" />
          ))}
        </div>
      </section>
      <LoadMoreSentinel
        root={scrollRoot}
        rootMargin="200px 0px"
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isPlaceholderData={isPlaceholderData}
        isLoading={isLoading}
      />
    </>
  )
}
