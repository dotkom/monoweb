"use client"

import { Icon } from "@iconify/react"
import { Box, Button, ButtonGroup, Skeleton, Stack } from "@mantine/core"
import Link from "next/link"
import { GenericTable } from "../../../components/GenericTable"
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
            <Icon icon="tabler:caret-left" />
          </Button>
          <Button variant="subtle">
            <Icon icon="tabler:caret-right" />
          </Button>
        </ButtonGroup>
      </Stack>
    </Skeleton>
  )
}
