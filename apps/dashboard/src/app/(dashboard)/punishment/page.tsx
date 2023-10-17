"use client"

import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"
import { GenericTable } from "src/components/GenericTable"
import { formatDate } from "../../../utils/format"
import { Mark } from "@dotkomonline/types"
import { usePunishmentAllQuery } from "src/modules/punishment/queries/use-punishment-all-query"

export default function MarkPage() {
  const { marks, isLoading: isMarksLoading } = usePunishmentAllQuery()

  const columnHelper = createColumnHelper<Mark>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => "Navn",
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Opprettet",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor((mark) => mark, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor size="sm" href={`/mark/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

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
