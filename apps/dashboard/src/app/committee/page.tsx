"use client"

import { Title, Text, Table, Button, Flex } from "@mantine/core"

import { trpc } from "../../trpc"
import { Committee } from "@dotkomonline/types"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { CommitteeDetailsModal } from "./CommitteeDetailsModal"
import { CommitteeCreationModal } from "./CommitteeCreationModal"

export default function CommitteePage() {
  const [isCreationOpen, setCreationOpen] = useState(false)
  const { data: committees = [], isLoading } = trpc.committee.all.useQuery({ offset: 0, limit: 50 })

  return (
    <Flex direction="column" p="md" gap="md">
      <div>
        <Title>Komiteer</Title>
        <Text>Oversikt over eksisterende komiteer</Text>
      </div>
      <div className="rounded bg-white shadow">
        {isLoading ? "Loading" : <CommitteeTable committees={committees} />}
      </div>
      {isCreationOpen && <CommitteeCreationModal close={() => setCreationOpen(false)} />}
      <div>
        <Button onClick={() => setCreationOpen(true)}>Opprett nytt komitee</Button>
      </div>
    </Flex>
  )
}

type CommitteeTableProps = { committees: Committee[] }

const CommitteeTable: FC<CommitteeTableProps> = ({ committees }) => {
  const columnHelper = createColumnHelper<Committee>()
  const columns = [
    columnHelper.accessor("name", {
      header: () => "Komiteenavn",
    }),
    columnHelper.accessor((committee) => committee, {
      id: "actions",
      header: () => "Detailjer",
      cell: (info) => <CommitteeTableDetailsCell committee={info.getValue()} />,
    }),
  ]
  const table = useReactTable({
    data: committees,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

type CommitteeTableDetailsCellProps = { committee: Committee }

const CommitteeTableDetailsCell: FC<CommitteeTableDetailsCellProps> = ({ committee }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Detaljer
      </Button>
      {isOpen && <CommitteeDetailsModal committee={committee} close={() => setOpen(false)} />}
    </>
  )
}
