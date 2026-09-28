"use client"

import { arrayOrEqualsFilter, FilterableDataTable } from "@/components/FilterableDataTable"
import {
  findActiveGroupMembershipIn,
  getGroupTypeName,
  type Group,
  type GroupMembership,
  GroupTypeSchema,
  sortGroupRolesByPriority,
} from "@dotkomonline/rpc/group"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  groups: Group[]
  isLoading?: boolean
  actions?: React.ReactNode
  userGroupMemberships?: GroupMembership[]
}

export const GroupTable = ({ groups, isLoading, actions, userGroupMemberships }: Props) => {
  const columnHelper = createColumnHelper<Group>()

  const columns = useMemo(() => {
    const cols = [
      columnHelper.accessor((group) => group.abbreviation, {
        id: "abbreviation",
        header: () => "Kort navn",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const group = info.row.original
          return <TextLink href={`/grupper/${group.slug}`}>{group.abbreviation}</TextLink>
        },
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
      userGroupMemberships !== undefined &&
        columnHelper.accessor(
          (group) => {
            const membership = findActiveGroupMembershipIn(userGroupMemberships, group.slug)
            const roles = membership?.roles ?? []

            if (!membership) {
              return "Ikke aktiv"
            }

            if (roles.length === 0) {
              return "Ingen roller"
            }

            return sortGroupRolesByPriority(roles)
              .map((role) => role.name)
              .join(", ")
          },
          {
            id: "roles",
            header: "Roller",
            sortingFn: "alphanumeric",
            cell: (info) => info.getValue(),
          }
        ),
    ]

    return cols.filter((col): col is Exclude<typeof col, false> => Boolean(col))
  }, [columnHelper, userGroupMemberships])

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
