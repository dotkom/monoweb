"use client"

import { arrayOrEqualsFilter, FilterableDataTable } from "@/components/FilterableDataTable"
import { type Group, GroupTypeSchema, getGroupTypeName } from "@dotkomonline/rpc/group"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  groups: Group[]
  isLoading?: boolean
  actions?: React.ReactNode
}

export const GroupTable = ({ groups, isLoading, actions }: Props) => {
  const columnHelper = createColumnHelper<Group>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((group) => group, {
        id: "abbreviation",
        header: () => "Kort navn",
        sortingFn: "alphanumeric",
        cell: (info) => <TextLink href={`/grupper/${info.getValue().slug}`}>{info.getValue().abbreviation}</TextLink>,
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
            <TextLink target="_blank" href={val} rel="noopener">
              Link
            </TextLink>
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
            <TextLink target="_blank" href={val} rel="noopener">
              Link
            </TextLink>
          )
        },
      }),
      columnHelper.accessor((group) => getGroupTypeName(group.type), {
        id: "type",
        header: "Type",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
        filterFn: arrayOrEqualsFilter(),
      }),
      columnHelper.accessor((group) => (!group.deactivatedAt ? "Aktiv" : "Inaktiv"), {
        id: "status",
        header: "Status",
        cell: (info) => info.getValue(),
        sortingFn: "alphanumeric",
        filterFn: arrayOrEqualsFilter(),
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
    <FilterableDataTable
      tableOptions={tableOptions}
      isLoading={isLoading}
      searchPlaceholder="Søk etter grupper..."
      actions={actions}
      filters={[
        { columnId: "status", label: "Aktiv", value: "Aktiv" },
        { columnId: "status", label: "Inaktiv", value: "Inaktiv" },
        ...GroupTypeSchema.options.map((groupType) => {
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
