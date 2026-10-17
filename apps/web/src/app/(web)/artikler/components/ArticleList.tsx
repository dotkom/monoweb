import type { ArticleFilterQuery } from "@dotkomonline/rpc/article"
import { cn } from "@dotkomonline/ui"
import { useArticleFilterQuery } from "../queries"
import { ArticleListItem } from "./ArticleListItem"
import { ArticleCard } from "./ArticleCard"
import { useEffect, useRef } from "react"

interface ArticleListProps {
  filters: {
    search: string
    tags: string[]
  }
}

export const ArticleList = ({ filters }: ArticleListProps) => {
  const query: ArticleFilterQuery = {
    bySearchTerm: filters.search,
    byTags: filters.tags,
  }
  const { articles, fetchNextPage } = useArticleFilterQuery(query)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        fetchNextPage()
      }
    })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [fetchNextPage])

  return (
    <>
      <section className={cn("flex w-full min-w-0 flex-col md:gap-2 sm:gap-6")}>
        <div className="grid w-full min-w-0 grid-cols-1 gap-2 md:grid-cols-3 sm:hidden">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} className="h-full min-w-0" />
          ))}
        </div>
        <div className="hidden flex-col gap-2 sm:flex">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} />
          ))}
        </div>
      </section>
      <div ref={loaderRef} />
    </>
  )
}
