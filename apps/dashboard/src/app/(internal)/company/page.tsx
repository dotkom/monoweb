"use client"

import { CompanySearchBar } from "./components/company-searchbar"
import { GenericTable } from "@/components/GenericTable"
import { Box, Button, Group, Skeleton, Stack } from "@mantine/core"
import Link from "next/link"
import { useCompanyTable } from "./components/use-company-table"
import { useCompanyAllQuery } from "./queries"
import { useMemo, useState } from "react"

interface CompanyFilterQuery {
  bySearchTerm?: string | null
}

export default function CompanyPage() {
  const [filter, setFilter] = useState<CompanyFilterQuery>({})
  const { companies, isLoading: isCompaniesLoading } = useCompanyAllQuery()
  
  const filteredCompanies = useMemo(() => {
    if (!filter.bySearchTerm?.trim()) return companies
    
    const searchLower = filter.bySearchTerm.toLowerCase().trim()
    return companies.filter((company) =>
      company.name.toLowerCase().includes(searchLower)
    )
  }, [companies, filter.bySearchTerm])
  
  const table = useCompanyTable({ data: filteredCompanies })

  return (
    <Stack>
      <Group>
        <CompanySearchBar onChange={setFilter} />

        <Box>
          <Button component={Link} href="/company/register">
            Ny bedrift
          </Button>
        </Box>
      </Group>

      <Skeleton visible={isCompaniesLoading}>
        <GenericTable table={table} />
      </Skeleton>
    </Stack>
  )
}
