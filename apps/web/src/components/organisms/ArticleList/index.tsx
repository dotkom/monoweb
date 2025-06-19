"use client"

import { ArticleFiltersContainer } from "@/components/molecules/ArticleFiltersContainer.tsx"
import { ArticleListItem } from "@/components/molecules/ArticleListItem"
import type { Article, ArticleTag } from "@dotkomonline/types"
import { compareDesc } from "date-fns"
import { useSearchParams } from "next/navigation"
import { type FC, useEffect, useRef, useState } from "react"

interface ArticleListProps {
  tags: ArticleTag[]
  articles: Article[]
}

export const ArticleList: FC<ArticleListProps> = ({ tags, articles }: ArticleListProps) => {
  const selectedTag = useSearchParams().get("tag")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredArticles = articles
    .filter((article) => {
      const matchesSearch = !search || article.title.toLowerCase().includes(search.toLowerCase())
      const matchesTag = !selectedTag || article.tags.includes(selectedTag)
      return matchesSearch && matchesTag
    })
    .sort((a, b) => compareDesc(a.updatedAt, b.updatedAt))
    .slice(0, page * pageSize)

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPage((prev) => prev + 1)
      }
    })

    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="flex md:flex-row flex-col gap-12">
        <div className="md:w-[30%] w-full">
          <ArticleFiltersContainer
            tags={tags.map((tag) => tag.name)}
            selectedTag={selectedTag}
            search={search}
            setSearch={setSearch}
          />
        </div>
        <div className="flex flex-col gap-8 md:w-[70%] h-fit">
          {filteredArticles.map((article) => (
            <ArticleListItem key={article.id} article={article} orientation="horizontal" />
          ))}
        </div>
      </div>
      <div ref={loaderRef} />
    </>
  )
}
