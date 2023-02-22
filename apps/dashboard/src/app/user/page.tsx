"use client"

import { Title, Text, Table, Button, Flex } from "@mantine/core"

import { trpc } from "../../trpc"
import { User } from "@dotkomonline/types"
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC, useState } from "react"
import { UserDetailsModal } from "./UserDetailsModal"
import DefaultUser from "./DefaultUser.svg";

export default function UsersPage() {
  const { data: users = [], isLoading } = trpc.auth.getUsers.useQuery({});

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


type UsersTableProfilePicture = { src?: string | null };

const UsersTableProfilePicture: FC<UsersTableProfilePicture> = ({ src }) => {
  const style = {width: "40px", height: "40px", borderRadius: "50%"};
  if (src)
    return <img src={src} alt="profile picture" style={style}/>
  else
    return <svg style={style} stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16 9C16 11.2091 14.2091 13 12 13C9.79086 13 8 11.2091 8 9C8 6.79086 9.79086 5 12 5C14.2091 5 16 6.79086 16 9ZM14 9C14 10.1046 13.1046 11 12 11C10.8954 11 10 10.1046 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1ZM3 12C3 14.0902 3.71255 16.014 4.90798 17.5417C6.55245 15.3889 9.14627 14 12.0645 14C14.9448 14 17.5092 15.3531 19.1565 17.4583C20.313 15.9443 21 14.0524 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12ZM12 21C9.84977 21 7.87565 20.2459 6.32767 18.9878C7.59352 17.1812 9.69106 16 12.0645 16C14.4084 16 16.4833 17.1521 17.7538 18.9209C16.1939 20.2191 14.1881 21 12 21Z" fill="currentColor"></path></svg>
}

type UsersTableProps = { users: User[] }

const UsersTable: FC<UsersTableProps> = ({ users }) => {
  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor("image", {
      header: () => "Bilde",
      cell: (info) => <UsersTableProfilePicture src={info.getValue()}/>
    }),
    columnHelper.accessor("name", {
      header: () => "Navn",
    }),
    columnHelper.accessor("email", {
      header: () => "Email"
    }),
    columnHelper.accessor("emailVerified", {
      header: () => "Email Verifisert"
    }),
    /*
    columnHelper.accessor((user) => user, {
      id: "actions",
      header: () => "Detailjer",
      cell: (info) => <UsersTableDetailsCell user={info.getValue()} />,
    }),
     */
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
