"use client"

import { ArticleFilters } from "@/app/artikler/ArticleFilters"
import { useArticleFilterQuery } from "@/app/artikler/queries"
import type { ArticleFilterQuery, ArticleTag } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { useSearchParams } from "next/navigation"
import { type FC, useEffect, useRef, useState } from "react"
import { ArticleListItem } from "./ArticleListItem"

interface ArticleListProps {
  tags: ArticleTag[]
}

export const ArticleList: FC<ArticleListProps> = ({ tags }: ArticleListProps) => {
  const queryTag = useSearchParams().get("tag")
  const [filters, setFilters] = useState<ArticleFilterQuery>({ byTags: queryTag ? [queryTag] : [] })
  const { articles, fetchNextPage } = useArticleFilterQuery(filters)

  let tagNames = tags.map((tag) => tag.name)

  // Always show the query tag so it can be deselected
  if (queryTag && !tagNames.includes(queryTag)) tagNames = [queryTag, ...tagNames]

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
      <div className="flex flex-col gap-8 w-full h-fit">
        {articles.length > 0 ? (
          articles.map((article) => (
            <ArticleListItem key={article.id} article={article} orientation="horizontal" />
          ))
        ) : (
          <div className="text-center py-12">
            <Text className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Ingen artikler funnet
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-500">
              Prøv å justere filtrene dine eller søk etter noe annet
            </Text>
          </div>
        )}
      </div>
      <div ref={loaderRef} />
    </>
  )
}
