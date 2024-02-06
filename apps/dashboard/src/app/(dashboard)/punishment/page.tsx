"use client"

import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type Mark, type MarkId } from "@dotkomonline/types"
import Link from "next/link"
import { formatDate } from "../../../utils/format"
import { useMarkCountUsersQuery } from "../../../modules/punishment/queries/use-count-users-with-mark-query"
import { usePunishmentAllQuery } from "../../../modules/punishment/queries/use-punishment-all-query"
import { GenericTable } from "../../../components/GenericTable"

function MarkUserCount({ markId }: { markId: MarkId }) {
  const { data } = useMarkCountUsersQuery(markId)
  return <>{data ?? 0}</>
}

const columnHelper = createColumnHelper<Mark>()
const columns = [
  columnHelper.accessor("title", {
    header: () => "Navn",
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
  columnHelper.accessor((mark) => mark, {
    id: "actions",
    header: () => "Detaljer",
    cell: (info) => (
      <Anchor component={Link} size="sm" href={`/punishment/${info.getValue().id}`}>
        Se mer
      </Anchor>
    ),
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
