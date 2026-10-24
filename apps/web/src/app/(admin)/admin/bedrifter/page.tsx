"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import type { CompanyFilterQuery } from "@dotkomonline/rpc/company"
import { canManageCompanies } from "@dotkomonline/rpc/company-permissions"
import { Button, Title } from "@dotkomonline/ui"
import { IconPencil } from "@tabler/icons-react"
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
  const authorization = useAuthorization()
  const canEdit = canManageCompanies(authorization)

  const { companies, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCompanyAllInfiniteQuery({
      filter,
    })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Bedrifter
      </Title>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CompanyFilters onChange={setFilter} defaultValues={filter} />
          <PermissionTooltip allowed={canEdit}>
            <Button
              variant="default"
              size="lg"
              element={Link}
              href="/admin/bedrifter/ny"
              icon={<IconPencil />}
              disabled={!canEdit}
            >
              Ny bedrift
            </Button>
          </PermissionTooltip>
        </div>

        <CompanyTable
          companies={companies}
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
