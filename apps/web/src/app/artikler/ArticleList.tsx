"use client"

import { ArticleFilters } from "@/app/artikler/ArticleFilters"
import { useArticleFilterQuery } from "@/app/artikler/queries"
import type { ArticleFilterQuery, ArticleTag } from "@dotkomonline/types"
import { useSearchParams } from "next/navigation"
import { type FC, useEffect, useRef, useState } from "react"
import { ArticleListItem } from "./ArticleListItem"

interface ArticleListProps {
  tags: ArticleTag[]
}

export const ArticleList: FC<ArticleListProps> = ({ tags }: ArticleListProps) => {
  const queryTag = useSearchParams().get("tag")
  const [filters, setFilters] = useState<ArticleFilterQuery>({ byTags: queryTag ? [queryTag] : [] })
  const { data, fetchNextPage } = useArticleFilterQuery(filters)

  const articles = data?.pages.flatMap((page) => page.items) ?? []

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
      <div className="flex md:flex-row flex-col gap-12">
        <div className="md:w-[30%] w-full scroll">
          <ArticleFilters onChange={setFilters} tags={tags.map((tag) => tag.name)} defaultValues={filters} />
        </div>
        <div className="flex flex-col gap-8 md:w-[70%] h-fit">
          {articles.map((article) => (
            <ArticleListItem key={article.id} article={article} orientation="horizontal" />
          ))}
        </div>
      </div>
      <div ref={loaderRef} />
    </>
  )
}
