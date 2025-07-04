"use client"

import { GenericTable } from "@/components/GenericTable"
import type { Mark, MarkId } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMarkCountUsersQuery } from "./queries/use-count-users-with-mark-query"
import { usePunishmentAllQuery } from "./queries/use-punishment-all-query"

function MarkUserCount({ markId }: Readonly<{ markId: MarkId }>) {
  const { data } = useMarkCountUsersQuery(markId)
  return <>{data ?? 0}</>
}

const columnHelper = createColumnHelper<Mark>()
const columns = [
  columnHelper.accessor((mark) => mark, {
    id: "title",
    header: () => "Navn",
    cell: (info) => (
      <Anchor component={Link} size="sm" href={`/punishment/${info.getValue().id}`}>
        {info.getValue().title}
      </Anchor>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: () => "Opprettet",
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.accessor((mark) => mark, {
    id: "count",
    header: () => "Antall",
    cell: (info) => <MarkUserCount markId={info.getValue().id} />,
  }),
]

export default function MarkPage() {
  const { marks, isLoading: isMarksLoading } = usePunishmentAllQuery()

  const table = useReactTable({
    data: marks,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isMarksLoading}>
      <Stack>
        <GenericTable table={table} />
        <Group justify="space-between">
          <ButtonGroup>
            <Button variant="subtle">
              <Icon icon="tabler:caret-left" />
            </Button>
            <Button variant="subtle">
              <Icon icon="tabler:caret-right" />
            </Button>
          </ButtonGroup>
        </Group>
      </Stack>
    </Skeleton>
  )
}
