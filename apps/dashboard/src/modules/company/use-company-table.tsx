"use client"

import { type Company } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { CompanyName } from "src/components/molecules/company-name/company-name"

interface Props {
  data: Company[]
}

export const useCompanyTable = ({ data }: Props) => {
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

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
