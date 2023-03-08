"use client"

import { Title, Text, Button, Flex } from "@mantine/core"

import { trpc } from "../../trpc"
import { Committee } from "@dotkomonline/types"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { CommitteeCreationModal } from "./CommitteeCreationModal"
import { GenericTable } from "../../components/GenericTable"
import { Icon } from "@iconify/react"
import Link from "next/link"

export default function CommitteePage() {
  const [isCreationOpen, setCreationOpen] = useState(false)
  const { data: committees = [], isLoading } = trpc.committee.all.useQuery()

  return (
    <Flex direction="column" p="md" gap="md">
      <div>
        <Title>Komiteer</Title>
        <Text>Oversikt over eksisterende komiteer</Text>
      </div>
      {isLoading ? "Loading" : <CommitteeTable committees={committees} />}
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
      header: () => "Detaljer",
      cell: (info) => <CommitteeTableDetailsCell committee={info.getValue()} />,
    }),
  ]
  const table = useReactTable({
    data: committees,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}

type CommitteeTableDetailsCellProps = { committee: Committee }

const CommitteeTableDetailsCell: FC<CommitteeTableDetailsCellProps> = ({ committee }) => {
  return (
    <Link href={`/committee/${committee.id}`}>
      <Button variant="outline" leftIcon={<Icon icon="tabler:list-details" />}>
        Se detailjer
      </Button>
    </Link>
  )
}
