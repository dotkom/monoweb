"use client"

import { type Membership, type UserId, getMembershipTypeName, getSpecializationName } from "@dotkomonline/types"
import { Button } from "@mantine/core"
import { IconEdit } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { useMemo } from "react"
import { useEditMembershipModal } from "./edit-membership-modal"

interface Props {
  data: Membership[]
  userId: UserId
}

export const useMembershipTable = ({ data, userId }: Props) => {
  const columnHelper = createColumnHelper<Membership>()
  const open = useEditMembershipModal()

  const columns = useMemo(
    () => [
      columnHelper.accessor("type", {
        header: () => "Type",
        cell: (info) => getMembershipTypeName(info.getValue()),
      }),
      columnHelper.accessor("start", {
        header: () => "Startdato",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy"),
      }),
      columnHelper.accessor("end", {
        header: () => "Sluttdato",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy"),
      }),
      columnHelper.accessor("specialization", {
        header: () => "Spesialisering",
        cell: (info) => {
          const specialization = info.getValue()

          return specialization ? getSpecializationName(specialization) : "-"
        },
      }),
      columnHelper.accessor((role) => role, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Button variant="outline" leftSection={<IconEdit />} onClick={() => open({ membership: info.getValue() })}>
            Oppdater
          </Button>
        ),
      }),
    ],
    [columnHelper, open]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
