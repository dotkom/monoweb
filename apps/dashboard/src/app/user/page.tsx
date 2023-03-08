"use client"

import { Title, Text, Button, Image, Flex } from "@mantine/core"

import { trpc } from "../../trpc"
import { User } from "@dotkomonline/types"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { FC } from "react"
import { Icon } from "@iconify/react"
import { GenericTable } from "../../components/GenericTable"
import Link from "next/link"

export default function UsersPage() {
  const { data: users = [], isLoading } = trpc.auth.getUsers.useQuery({})

  return (
    <Flex direction="column" p="md" gap="md">
      <div>
        <Title>Komiteer</Title>
        <Text>Oversikt over eksisterende komiteer</Text>
      </div>
      {isLoading ? "Loading" : <UsersTable users={users} />}
    </Flex>
  )
}

type UsersTableProps = { users: User[] }

const UsersTable: FC<UsersTableProps> = ({ users }) => {
  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor("image", {
      header: () => "Bilde",
      cell: (info) => {
        const image = info.getValue()
        return image !== null ? (
          <Image width={40} height={40} src={image} alt="profile picture" radius={99999} />
        ) : (
          <Icon width={40} height={40} icon="tabler:user-circle" />
        )
      },
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
      header: () => "Detaljer",
      cell: (info) => <UsersTableDetailsCell user={info.getValue()} />,
    }),
  ]
  const table = useReactTable({
    data: users,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} />
}

type UsersTableDetailsCellProps = { user: User }

const UsersTableDetailsCell: FC<UsersTableDetailsCellProps> = ({ user }) => {
  return (
    <Link href={`/user/${user.id}`}>
      <Button variant="outline" leftIcon={<Icon icon="tabler:list-details" />}>
        Se detailjer
      </Button>
    </Link>
  )
}
