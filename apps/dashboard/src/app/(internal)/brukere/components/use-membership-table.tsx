"use client"

import { type Membership, type UserId, getMembershipTypeName, getSpecializationName } from "@dotkomonline/types"
import { Button } from "@mantine/core"
import { IconEdit, IconTrash } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { useMemo } from "react"
import { useIsAdminQuery } from "../queries"
import { useConfirmDeleteMembershipModal } from "./confirm-delete-membership-modal"
import { useEditMembershipModal } from "./edit-membership-modal"
import { getStudyGrade, isSpringSemester } from "@dotkomonline/utils"

interface Props {
  data: Membership[]
  userId: UserId
}

export const useMembershipTable = ({ data }: Props) => {
  const { isAdmin } = useIsAdminQuery()
  const columnHelper = createColumnHelper<Membership>()
  const openEditMembershipModal = useEditMembershipModal()
  const openDeleteMembershipModal = useConfirmDeleteMembershipModal()

  const columns = useMemo(
    () => [
      columnHelper.accessor("type", {
        header: () => "Type",
        cell: (info) => getMembershipTypeName(info.getValue()),
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
      columnHelper.accessor("specialization", {
        header: () => "Spesialisering",
        cell: (info) => {
          const specialization = info.getValue()

          return specialization ? getSpecializationName(specialization) : "-"
        },
      }),
      columnHelper.accessor("start", {
        header: () => "Startdato",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy"),
      }),
      columnHelper.accessor("end", {
        header: () => "Sluttdato",
        cell: (info) => {
          const endDate = info.getValue()

          if (!endDate) {
            return "-"
          }

          return formatDate(endDate, "dd.MM.yyyy")
        },
      }),
      columnHelper.accessor((role) => role, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Button
            size="sm"
            leftSection={<IconEdit size="1rem" />}
            onClick={() => openEditMembershipModal({ membership: info.getValue() })}
          >
            Oppdater
          </Button>
        ),
      }),
      ...(isAdmin
        ? [
            columnHelper.accessor((role) => role, {
              id: "delete",
              header: () => "Slett medlemskap",
              cell: (info) => (
                <Button
                  variant="filled"
                  color="red"
                  size="sm"
                  leftSection={<IconTrash size="1rem" />}
                  onClick={() => openDeleteMembershipModal({ membership: info.getValue() })()}
                >
                  Slett
                </Button>
              ),
            }),
          ]
        : []),
    ],
    [columnHelper, openEditMembershipModal, openDeleteMembershipModal, isAdmin]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
