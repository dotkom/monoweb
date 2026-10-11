"use client"

import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import { ConfirmDeleteModal } from "@admin/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { PermissionTooltip } from "@admin/components/PermissionTooltip"
import { type GroupRole, getGroupRoleTypeName } from "@dotkomonline/rpc/group"
import { Button } from "@dotkomonline/ui"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo, useState } from "react"

interface Props {
  roles: GroupRole[]
  defaultRoleId: string
  canManageRoles: boolean
  onEdit: (role: GroupRole) => void
  onDelete: (role: GroupRole) => void
  actions?: React.ReactNode
}

export const GroupRoleTable = ({ roles, defaultRoleId, canManageRoles, onEdit, onDelete, actions }: Props) => {
  const [roleToDelete, setRoleToDelete] = useState<GroupRole | null>(null)

  const columnHelper = createColumnHelper<GroupRole>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((role) => role.name, {
        id: "name",
        header: () => "Navn",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const role = info.row.original
          if (role.id === defaultRoleId) {
            return `${role.name} (standard)`
          }

          return role.name
        },
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
        sortingFn: "alphanumeric",
        cell: (info) => getGroupRoleTypeName(info.getValue()),
      }),
      columnHelper.accessor((role) => role, {
        id: "actions",
        header: () => "Handlinger",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => (
          <PermissionTooltip allowed={canManageRoles}>
            <Button
              variant="outline"
              size="sm"
              icon={<IconEdit className="size-4" />}
              disabled={!canManageRoles}
              onClick={() => onEdit(info.getValue())}
            >
              Rediger
            </Button>
          </PermissionTooltip>
        ),
      }),
      columnHelper.accessor((role) => role, {
        id: "delete",
        header: () => "Slett",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => (
          <PermissionTooltip allowed={canManageRoles}>
            <Button
              variant="destructive"
              size="sm"
              icon={<IconTrash className="size-4" />}
              disabled={!canManageRoles}
              onClick={() => setRoleToDelete(info.getValue())}
            >
              Slett
            </Button>
          </PermissionTooltip>
        ),
      }),
    ],
    [columnHelper, canManageRoles, onEdit, defaultRoleId]
  )

  const tableOptions = useMemo(
    () => ({
      data: roles,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [roles, columns]
  )

  return (
    <>
      <FilterableDataTable tableOptions={tableOptions} searchPlaceholder="Søk etter roller..." actions={actions} />
      <ConfirmDeleteModal
        open={roleToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRoleToDelete(null)
          }
        }}
        onConfirm={() => {
          if (roleToDelete === null) {
            return
          }

          onDelete(roleToDelete)
          setRoleToDelete(null)
        }}
        title={`Slett rolle ${roleToDelete?.name}`}
        description={`Er du sikker på at du vil slette rollen ${roleToDelete?.name}?`}
      />
    </>
  )
}
