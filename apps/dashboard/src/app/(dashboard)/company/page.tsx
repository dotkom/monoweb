"use client"

import { trpc } from "../../../utils/trpc"
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
import { Company } from "@dotkomonline/types"
import { useMemo, useState } from "react"
import { formatDate } from "../../../utils/format"
import { Icon } from "@iconify/react"
import { CompanyCreationModal } from "./create-modal"

export default function CompanyPage() {
  const { data: companies = [], isLoading: isCompaniesLoading } = trpc.company.all.useQuery({ take: 50 })
  const [isCreationOpen, setCreationOpen] = useState(false)

  const columnHelper = createColumnHelper<Company>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Navn",
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Opprettet",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor size="sm" href={`/company/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

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
          <Button onClick={() => setCreationOpen(true)}>Opprett bedrift</Button>
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </Group>

        {isCreationOpen && <CompanyCreationModal close={() => setCreationOpen(false)} />}
      </Stack>
    </Skeleton>
  )
}
