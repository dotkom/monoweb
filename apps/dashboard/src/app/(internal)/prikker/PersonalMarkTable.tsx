"use client"

import { DateTooltip } from "@/components/DateTooltip"
import { FilterableDataTable } from "@/components/FilterableDataTable"
import type { MarkId, PersonalMarkDetails } from "@dotkomonline/rpc/mark"
import { Button, TextLink } from "@dotkomonline/ui"
import { IconTrash } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"
import { useRemovePersonalMarkFromUserMutation } from "./mutations"

interface Props {
  markId: MarkId
  personalMarks: PersonalMarkDetails[]
  isLoading?: boolean
  actions?: React.ReactNode
}

const columnHelper = createColumnHelper<PersonalMarkDetails>()

export const PersonalMarkTable = ({ markId, personalMarks, isLoading, actions }: Props) => {
  const removeMark = useRemovePersonalMarkFromUserMutation(markId)

  const columns = useMemo(
    () => [
      columnHelper.accessor((personalMark) => personalMark.user.name, {
        id: "userName",
        header: () => "Bruker",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const user = info.row.original.user
          return <TextLink href={`/brukere/${user.id}`}>{user.name}</TextLink>
        },
      }),
      columnHelper.accessor((personalMark) => personalMark.personalMark.createdAt, {
        id: "createdAt",
        header: () => "Gitt",
        sortingFn: "datetime",
        enableGlobalFilter: false,
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor((personalMark) => personalMark, {
        id: "remove",
        header: () => "Fjern prikk",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              const {
                user: { id: userId },
                personalMark: { markId: personalMarkId },
              } = info.getValue()

              removeMark.mutate({ userId, markId: personalMarkId })
            }}
            icon={<IconTrash className="size-4" />}
          >
            Fjern
          </Button>
        ),
      }),
    ],
    [removeMark]
  )

  const tableOptions = useMemo(
    () => ({
      data: personalMarks,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [personalMarks, columns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      searchPlaceholder="Søk etter brukere..."
      isLoading={isLoading}
      actions={actions}
    />
  )
}
