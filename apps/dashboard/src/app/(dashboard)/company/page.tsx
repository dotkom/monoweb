"use client"

import {
  Anchor,
  Button,
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
import { useMemo } from "react"
import { useCompanyAllQuery } from "../../../modules/company/queries/use-company-all-query"
import { CompanyName } from "../../../components/molecules/company-name/company-name"
import Link from "next/link"
import { useCreateCompanyModal } from "../../../modules/company/modals/create-company-modal"

export default function CompanyPage() {
  const { companies, isLoading } = useCompanyAllQuery()
  const open = useCreateCompanyModal()

  const columnHelper = createColumnHelper<Company>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((evt) => evt, {
        id: "name",
        header: () => "Bedrift",
        cell: (info) => <CompanyName company={info.getValue()} />,
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: () => "Kontakt e-post",
        cell: (info) => (
          <Anchor size="sm" href={`mailto:${info.getValue()}`}>
            {info.getValue()}
          </Anchor>
        ),
      }),
      columnHelper.accessor("phone", {
        id: "phone",
        header: () => "Kontakt telefon",
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
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: companies,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isLoading}>
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
        <Group justify="start">
          <Button onClick={open}>Registrer ny bedrift</Button>
        </Group>
      </Stack>
    </Skeleton>
  )
}
