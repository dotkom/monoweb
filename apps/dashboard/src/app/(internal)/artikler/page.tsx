"use client"

import type { ArticleFilterQuery } from "@dotkomonline/rpc/article"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
import Link from "next/link"
import { useState } from "react"
import { ArticleFilters } from "./ArticleFilters"
import { ArticleTable } from "./ArticleTable"
import { useArticleAllInfiniteQuery } from "./queries"

export default function ArticlePage() {
  const [filter, setFilter] = useState<ArticleFilterQuery>({
    bySearchTerm: null,
    byTags: [],
    byIsFeatured: null,
  })

  const { articles, isLoading, isPlaceholderData, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useArticleAllInfiniteQuery({ filter })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Artikler
      </Title>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <ArticleFilters onChange={setFilter} defaultValues={filter} />
          <Button variant="default" size="lg" element={Link} href="/artikler/ny" icon={<IconPencil />}>
            Ny artikkel
          </Button>
        </div>

        <ArticleTable
          articles={articles}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </div>
  )
}
