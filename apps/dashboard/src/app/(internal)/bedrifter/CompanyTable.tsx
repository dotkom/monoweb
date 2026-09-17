"use client"

import { DataTable } from "@/components/DataTable"
import type { Company } from "@dotkomonline/rpc/company"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  companies: Company[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export const CompanyTable = ({
  companies,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const columnHelper = createColumnHelper<Company>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((company) => company, {
        id: "title",
        header: () => "Bedrift",
        cell: (info) => <TextLink href={`/bedrifter/${info.getValue().slug}`}>{info.getValue().name}</TextLink>,
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: () => "Kontakt-e-post",
        cell: (info) => <TextLink href={`mailto:${info.getValue()}`}>{info.getValue()}</TextLink>,
      }),
      columnHelper.accessor("phone", {
        id: "phone",
        header: () => "Kontakttelefon",
        cell: (info) => {
          const phoneNumber = info.getValue()
          if (phoneNumber) {
            return <TextLink href={`tel:${phoneNumber}`}>{phoneNumber}</TextLink>
          }
          return null
        },
      }),
      columnHelper.accessor("website", {
        id: "website",
        header: () => "Nettside",
        cell: (info) => (
          <TextLink href={info.getValue()} target="_blank" rel="noopener noreferrer">
            {info.getValue()}
          </TextLink>
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
    <DataTable
      table={table}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
