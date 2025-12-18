"use client"

import { GenericTable } from "@/components/GenericTable"
import { Box, Button, Skeleton, Stack } from "@mantine/core"
import Link from "next/link"
import { useCompanyTable } from "./components/use-company-table"
import { useCompanyAllQuery } from "./queries"

export default function CompanyPage() {
  const { companies, isLoading: isCompaniesLoading } = useCompanyAllQuery()
  const table = useCompanyTable({ data: companies })

  return (
    <Skeleton visible={isCompaniesLoading}>
      <Stack>
        <Box>
          <Button component={Link} href="/bedrifter/ny">
            Ny bedrift
          </Button>
        </Box>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
