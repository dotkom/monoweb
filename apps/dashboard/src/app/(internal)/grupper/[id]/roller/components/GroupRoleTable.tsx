"use client"

import { FilterableDataTable } from "@/components/FilterableDataTable"
import { type GroupRole, getGroupRoleTypeName } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { IconEdit } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  roles: GroupRole[]
  canManageRoles: boolean
  onEdit: (role: GroupRole) => void
  actions?: React.ReactNode
}

export const GroupRoleTable = ({ roles, canManageRoles, onEdit, actions }: Props) => {
  const columnHelper = createColumnHelper<GroupRole>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((role) => role.name, {
        id: "name",
        header: () => "Navn",
        sortingFn: "alphanumeric",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
        sortingFn: "alphanumeric",
        cell: (info) => getGroupRoleTypeName(info.getValue()),
      }),
      columnHelper.accessor((role) => role, {
        id: "actions",
        header: () => "Detaljer",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<IconEdit className="size-4" />}
            disabled={!canManageRoles}
            onClick={() => onEdit(info.getValue())}
          >
            Rediger
          </Button>
        ),
      }),
    ],
    [columnHelper, canManageRoles, onEdit]
  )

  const tableOptions = useMemo(
    () => ({
      data: roles,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [roles, columns]
  )

  return <FilterableDataTable tableOptions={tableOptions} searchPlaceholder="Søk etter roller..." actions={actions} />
}
