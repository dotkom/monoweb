"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { DateTooltip } from "@/components/DateTooltip"
import { FilterableDataTable } from "@/components/FilterableDataTable"
import { ConfirmDeleteModal } from "@/components/molecules/ConfirmDeleteModal/ConfirmDeleteModal"
import { type Membership, getMembershipTypeName, getSpecializationName } from "@dotkomonline/rpc/user"
import { Button } from "@dotkomonline/ui"
import { getStudyGrade, isSpringSemester } from "@dotkomonline/utils"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { EditMembershipModal } from "./EditMembershipModal"
import { useDeleteMembershipMutation } from "../../../mutations"

interface Props {
  data: Membership[]
  actions?: React.ReactNode
}

export function MembershipTable({ data, actions }: Props) {
  const { canManageUserMemberships } = useAuthorization()
  const canManage = canManageUserMemberships()
  const deleteMembership = useDeleteMembershipMutation()

  const [editMembership, setEditMembership] = useState<Membership | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Membership | null>(null)

  const columnHelper = createColumnHelper<Membership>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((membership) => (membership.type ? getMembershipTypeName(membership.type) : "-"), {
        id: "type",
        header: () => "Type",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("semester", {
        header: () => "Semester",
        cell: (info) => {
          const zeroIndexSemester = info.getValue()

          if (zeroIndexSemester == null) {
            return "-"
          }

          const season = isSpringSemester(zeroIndexSemester) ? "våren" : "høsten"
          const grade = getStudyGrade(zeroIndexSemester)

          return `${zeroIndexSemester + 1}. sem. (${season} ${grade}. år)`
        },
      }),
      columnHelper.accessor(
        (membership) => (membership.specialization ? getSpecializationName(membership.specialization) : "-"),
        {
          id: "specialization",
          header: () => "Spesialisering",
          cell: (info) => info.getValue(),
        }
      ),
      columnHelper.accessor("start", {
        header: () => "Startdato",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("end", {
        header: () => "Sluttdato",
        cell: (info) => {
          const endDate = info.getValue()

          if (!endDate) {
            return "-"
          }

          return <DateTooltip date={endDate} />
        },
      }),
      ...(canManage
        ? [
            columnHelper.display({
              id: "actions",
              header: () => "Detaljer",
              cell: ({ row }) => (
                <Button
                  variant="default"
                  size="sm"
                  icon={<IconEdit className="size-4" />}
                  onClick={() => {
                    setEditMembership(row.original)
                  }}
                >
                  Oppdater
                </Button>
              ),
            }),
            columnHelper.display({
              id: "delete",
              header: () => "Slett medlemskap",
              cell: ({ row }) => (
                <Button
                  variant="destructive"
                  size="sm"
                  icon={<IconTrash className="size-4" />}
                  onClick={() => {
                    setDeleteTarget(row.original)
                  }}
                >
                  Slett
                </Button>
              ),
            }),
          ]
        : []),
    ],
    [canManage, columnHelper]
  )

  const tableOptions = useMemo(
    () => ({
      data,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [columns, data]
  )

  return (
    <>
      <FilterableDataTable tableOptions={tableOptions} searchPlaceholder="Søk i medlemskap..." actions={actions} />

      <EditMembershipModal
        open={editMembership !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditMembership(null)
          }
        }}
        membership={editMembership}
      />
      <ConfirmDeleteModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        title="Slett medlemskap"
        description="Er du sikker på at du vil slette dette medlemskapet?"
        confirmLabel="Slett medlemskap"
        cancelLabel="Avbryt"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMembership.mutate({ membershipId: deleteTarget.id })
          }
        }}
      />
    </>
  )
}
