"use client"

import { FilterableTable } from "@/components/molecules/FilterableTable/FilterableTable"
import { type Group, GroupTypeSchema, getGroupTypeName } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  groups: Group[]
}

export const AllGroupsTable = ({ groups }: Props) => {
  const columnHelper = createColumnHelper<Group>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((group) => group, {
        id: "abbreviation",
        header: () => "Kort navn",
        sortingFn: "alphanumeric",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/grupper/${info.getValue().slug}`}>
            {info.getValue().abbreviation}
          </Anchor>
        ),
      }),
      columnHelper.accessor("name", {
        header: () => "Navn",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("email", {
        header: () => "Kontakt-e-post",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("contactUrl", {
        header: () => "Kontakt-lenke",
        enableSorting: false,
        cell: (info) => {
          const val = info.getValue()
          if (!val) {
            return "Ingen lenke"
          }
          return (
            <Anchor component={Link} size="sm" target="_blank" href={val} rel="noopener">
              Link
            </Anchor>
          )
        },
      }),
      columnHelper.accessor("imageUrl", {
        header: () => "Bilde",
        enableSorting: false,
        cell: (info) => {
          const val = info.getValue()
          if (!val) {
            return "Ingen bilde"
          }
          return (
            <Anchor component={Link} size="sm" target="_blank" href={val} rel="noopener">
              Link
            </Anchor>
          )
        },
      }),
      columnHelper.accessor((group) => getGroupTypeName(group.type), {
        id: "type",
        header: "Type",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
        filterFn: "arrIncludes",
      }),
      columnHelper.accessor((group) => (!group.deactivatedAt ? "Aktiv" : "Inaktiv"), {
        id: "status",
        header: "Status",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
        filterFn: "arrIncludes",
      }),
    ],
    [columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data: groups,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [groups, columns]
  )

  return (
    <FilterableTable
      tableOptions={tableOptions}
      filters={[
        { columnId: "status", label: "Aktiv", value: "Aktiv" },
        { columnId: "status", label: "Inaktiv", value: "Inaktiv" },
        ...Object.values(GroupTypeSchema.Values).map((groupType) => {
          const typeName = getGroupTypeName(groupType)

          return {
            columnId: "type",
            label: typeName,
            value: typeName,
          }
        }),
      ]}
    />
  )
}
