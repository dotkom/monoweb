"use client"

import { Icon } from "@iconify/react"
import { Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { GenericTable } from "../../../components/GenericTable"
import { useCreateCompanyModal } from "../../../modules/company/modals/create-company-modal"
import { useCompanyAllQuery } from "../../../modules/company/queries/use-company-all-query"
import { useCompanyTable } from "../../../modules/company/use-company-table"

export default function CompanyPage() {
  const { companies, isLoading: isCompaniesLoading } = useCompanyAllQuery()
  const open = useCreateCompanyModal()
  const table = useCompanyTable({ data: companies })

  return (
    <Skeleton visible={isCompaniesLoading}>
      <Stack>
        <GenericTable table={table} />
        <Group justify="space-between">
          <Button onClick={open}>Opprett bedrift</Button>
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
