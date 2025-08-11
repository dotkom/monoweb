"use client"

import { GenericTable } from "@/components/GenericTable"
import { Box, Button, ButtonGroup, Skeleton, Stack } from "@mantine/core"
import { IconCaretLeft, IconCaretRight } from "@tabler/icons-react"
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
          <Button component={Link} href="/company/register">
            Ny bedrift
          </Button>
        </Box>
        <GenericTable table={table} />
        <ButtonGroup ml="auto">
          <Button variant="subtle">
            <IconCaretLeft />
          </Button>
          <Button variant="subtle">
            <IconCaretRight />
          </Button>
        </ButtonGroup>
      </Stack>
    </Skeleton>
  )
}
