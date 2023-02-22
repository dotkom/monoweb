"use client"

import { Title, Text, Table, Button, Image, Flex } from "@mantine/core"

import { trpc } from "../../trpc"
import { User } from "@dotkomonline/types"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { UserDetailsModal } from "./UserDetailsModal"
import { Icon } from "@iconify/react"

export default function UsersPage() {
  const { data: users = [], isLoading } = trpc.auth.getUsers.useQuery({})

  return (
    <Flex direction="column" p="md" gap="md">
      <div>
        <Title>Komiteer</Title>
        <Text>Oversikt over eksisterende komiteer</Text>
      </div>
      <div className="rounded shadow">{isLoading ? "Loading" : <UsersTable users={users} />}</div>
    </Flex>
  )
}

type UsersTableProfilePicture = { src?: string | null }

const UsersTableProfilePicture: FC<UsersTableProfilePicture> = ({ src }) => {
  if (src) return <Image width={40} height={40} src={src} alt="profile picture" radius={99999} />
  else return <Icon width={40} height={40} icon="mdi:account-circle" />
}

type UsersTableProps = { users: User[] }

const UsersTable: FC<UsersTableProps> = ({ users }) => {
  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor("image", {
      header: () => "Bilde",
      cell: (info) => <UsersTableProfilePicture src={info.getValue()} />,
    }),
    columnHelper.accessor("name", {
      header: () => "Navn",
    }),
    columnHelper.accessor("email", {
      header: () => "Email",
    }),
    columnHelper.accessor("emailVerified", {
      header: () => "Email Verifisert",
    }),
    columnHelper.accessor((user) => user, {
      id: "actions",
      header: () => "Detailjer",
      cell: (info) => <UsersTableDetailsCell user={info.getValue()} />,
    }),
  ]
  const table = useReactTable({
    data: users,
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

type UsersTableDetailsCellProps = { user: User }

const UsersTableDetailsCell: FC<UsersTableDetailsCellProps> = ({ user }) => {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Detaljer
      </Button>
      {isOpen && <UserDetailsModal user={user} close={() => setOpen(false)} />}
    </>
  )
}
