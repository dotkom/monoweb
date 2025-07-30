"use client"

import { GenericTable } from "@/components/GenericTable"
import type { Mark } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import { Icon } from "@iconify/react"
import { Anchor, Button, ButtonGroup, Group, Skeleton, Stack } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useCreateMarkModal } from "./modals/create-mark-modal"
import { useCreateSuspensionModal } from "./modals/create-suspension-modal"
import { usePunishmentAllQuery } from "./queries/use-punishment-all-query"

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
  columnHelper.accessor("weight", {
    header: () => "Vekt",
    cell: (info) => {
      const value = info.getValue();

      return <>{value === 6 ? "Suspensjon" : value.toString()}</>
    }
  }),
  columnHelper.accessor("duration", {
    header: () => "Varighet",
    cell: (info) => `${info.getValue()} dager`,
  }),
  columnHelper.accessor("groupSlug", {
    header: () => "Gruppe",
    cell: (info) => info.getValue(),
  }),
]

export default function MarkPage() {
  const { marks, isLoading: isMarksLoading } = usePunishmentAllQuery()

  const table = useReactTable({
    data: marks,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  const openCreateMarkModal = useCreateMarkModal()
  const openCreateSuspensionModal = useCreateSuspensionModal()

  return (
    <Skeleton visible={isMarksLoading}>
      <Stack>
        <Group>
          <Button onClick={openCreateMarkModal}>Gi ny prikk</Button>
          <Button onClick={openCreateSuspensionModal}>Gi ny suspensjon</Button>
        </Group>

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
