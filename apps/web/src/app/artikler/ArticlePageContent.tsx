"use client"

import { ArticleList } from "@/app/artikler/ArticleList"
import { ArticleSearchSection } from "@/app/artikler/ArticleSearchSection"
import { Text, Title } from "@dotkomonline/ui"
import type { ArticleFilterQuery } from "@dotkomonline/types"
import { useState } from "react"
import { useSearchParams } from "next/navigation"

interface ArticlePageContentProps {
  tags: { name: string }[]
}

export const ArticlePageContent = ({ tags }: ArticlePageContentProps) => {
  const queryTag = useSearchParams().get("tag")
  const [filters, setFilters] = useState<ArticleFilterQuery>({
    byTags: queryTag ? [queryTag] : [],
    bySearchTerm: ""
  })

  return (
    <div>
      <div className="border-gray-600 border-b">
        <div className="flex flex-col pb-5">
          <Title element="h1" className="text-3xl">
            Artikler
          </Title>
          <Text className="pt-2">Les artikler skrevet av medlemmer i Online.</Text>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        <div className="flex-shrink-0">
          <ArticleSearchSection
            tags={tags}
            onChange={setFilters}
            defaultValues={filters}
          />
        </div>
        <div className="flex-1">
          <ArticleList tags={tags} filters={filters} />
        </div>
      </div>
    </div>
  )
}
