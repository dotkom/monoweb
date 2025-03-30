"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
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
        <GenericTable table={table} />
        <Group justify="space-between">
          <Button component={Link} href="/company/register">
            Ny bedrift
          </Button>
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </Group>
      </Stack>
    </Skeleton>
  )
}
