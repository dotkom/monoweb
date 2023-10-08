"use client"

import { Icon } from "@iconify/react"
import {
  Button,
  ButtonGroup,
  Card,
  Group,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core"
import { flexRender } from "@tanstack/react-table"
import { useCreateCompanyModal } from "src/modules/company/modals/create-company-modal"
import { useCompanyAllQuery } from "src/modules/company/queries/use-company-all-query"
import { useCompanyTable } from "src/modules/company/use-company-table"

export default function CompanyPage() {
  const { companies, isLoading: isCompaniesLoading } = useCompanyAllQuery()
  const open = useCreateCompanyModal()
  const table = useCompanyTable({ data: companies })

  return (
    <Skeleton visible={isCompaniesLoading}>
      <Stack>
        <Card withBorder>
          <Table>
            <TableThead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableTr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableTh key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableTh>
                  ))}
                </TableTr>
              ))}
            </TableThead>
            <TableTbody>
              {table.getRowModel().rows.map((row) => (
                <TableTr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
                  ))}
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Card>
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
