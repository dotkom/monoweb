"use client"

import type { Company } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: Company[]
}

export const useCompanyTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Company>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((company) => company, {
        id: "title",
        header: () => "Bedrift",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/company/${info.getValue().id}`}>
            {info.getValue().name}
          </Anchor>
        ),
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: () => "Kontakt-e-post",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`mailto:${info.getValue()}`}>
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
              <Anchor component={Link} size="sm" href={`tel:${phoneNumber}`}>
                {phoneNumber}
              </Anchor>
            )
          }
          return null
        },
      }),
    ],
    [columnHelper]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
