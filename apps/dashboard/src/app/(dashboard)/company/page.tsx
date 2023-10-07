"use client"

import { Company } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import {
  Anchor,
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
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { CompanyName } from "src/components/molecules/company-name/company-name"
import { useCreateCompanyModal } from "src/modules/company/modals/create-company-modal"
import { useCompanyAllQuery } from "src/modules/company/queries/use-company-all-query"
import Link from "next/link"

export default function CompanyPage() {
  const { companies, isLoading: isCompaniesLoading } = useCompanyAllQuery()
  const open = useCreateCompanyModal()

  const columnHelper = createColumnHelper<Company>()
  const columns = [
    columnHelper.accessor((evt) => evt, {
      id: "name",
      header: () => "Bedrift",
      cell: (info) => <CompanyName company={info.getValue()} />,
    }),
    columnHelper.accessor("email", {
      id: "email",
      header: () => "Kontakt-e-post",
      cell: (info) => (
        <Anchor size="sm" href={`mailto:${info.getValue()}`}>
          {info.getValue()}
        </Anchor>
      ),
    }),
    columnHelper.accessor("phone", {
      id: "phone",
      header: () => "Kontakttelefon",
      cell: (info) => {
        const phoneNumber = info.getValue()
        if (phoneNumber) {
          return (
            <Anchor size="sm" href={`tel:${phoneNumber}`}>
              {phoneNumber}
            </Anchor>
          )
        }
        return null
      },
    }),
    columnHelper.accessor((evt) => evt, {
      id: "actions",
      header: () => "Detaljer",
      cell: (info) => (
        <Anchor size="sm" component={Link} href={`/company/${info.getValue().id}`}>
          Se mer
        </Anchor>
      ),
    }),
  ]

  const table = useReactTable({
    data: companies,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isCompaniesLoading}>
      <Stack>
        <Card withBorder>
          <Table>
            <TableThead>
              <div>test test</div>
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
