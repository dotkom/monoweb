"use client"

import { trpc } from "../../../utils/trpc"
import {
  Anchor,
  Button,
  ButtonGroup,
  Card,
  Group,
  Skeleton,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
} from "@mantine/core"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Event } from "@dotkomonline/types"
import { useMemo } from "react"
import { formatDate } from "../../../utils/format"
import { Icon } from "@iconify/react"
import { useCreateEventModal } from "../../../modules/event/modals/create-event-modal"

export default function EventPage() {
  const { data: events = [], isLoading: isEventsLoading } = trpc.event.all.useQuery({ take: 50 })
  const { data: committees = [], isLoading: isCommitteesLoading } = trpc.committee.all.useQuery({ take: 999 })
  const open = useCreateEventModal()

  const columnHelper = createColumnHelper<Event>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => "Arrangementnavn",
      }),
      columnHelper.accessor("start", {
        header: () => "Startdato",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("committeeId", {
        header: () => "Arrangør",
        cell: (info) => {
          const match = committees.find((committee) => committee.id === info.getValue()) ?? null
          if (match !== null) {
            return (
              <Anchor size="sm" href={`/committee/${match.id}`}>
                {match.name}
              </Anchor>
            )
          }
          return "Ukjent arrangør"
        },
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor size="sm" href={`/event/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [committees, columnHelper]
  )

  const table = useReactTable({
    data: events,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Skeleton visible={isEventsLoading || isCommitteesLoading}>
      <Stack>
        <Card withBorder>
          <Table>
            <TableThead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableTr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableTh key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableTh>
                  ))}
                </TableTr>
              ))}
            </TableThead>
            <TableTbody>
              {table.getRowModel().rows.map((row) => (
                <TableTr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
                  ))}
                </TableTr>
              ))}
            </TableTbody>
          </Table>
        </Card>
        <Group justify="space-between">
          <Button onClick={open}>Opprett arrangement</Button>
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
