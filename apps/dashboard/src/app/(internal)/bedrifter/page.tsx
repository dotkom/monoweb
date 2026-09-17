"use client"

import type { CompanyFilterQuery } from "@dotkomonline/rpc/company"
import { Button } from "@dotkomonline/ui"
import Link from "next/link"
import { useState } from "react"
import { CompanyFilters } from "./CompanyFilters"
import { CompanyTable } from "./CompanyTable"
import { useCompanyAllInfiniteQuery } from "./queries"

export default function CompanyPage() {
  const [filter, setFilter] = useState<CompanyFilterQuery>({
    orderBy: "asc",
    sortBy: "name",
  })

  const { companies, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCompanyAllInfiniteQuery({
      filter,
    })

  return (
    <div className="flex flex-col gap-2">
      <Button variant="default" className="w-fit" element={Link} href="/bedrifter/ny">
        Ny bedrift
      </Button>
      <CompanyFilters onChange={setFilter} defaultValues={filter} />
      <CompanyTable
        companies={companies}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}
