"use client"

import { Button, Flex, Image, Text, Title } from "@mantine/core"
import { RouterOutputs, trpc } from "../../trpc"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { FC } from "react"
import { GenericTable } from "../../components/GenericTable"
import { Icon } from "@iconify/react"
import Link from "next/link"

export default function UsersPage() {
  const { data: users = [], isLoading } = trpc.user.getUsers.useQuery({})

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
type Users = RouterOutputs["user"]["getUsers"]
type User = Users[number]

type UsersTableProps = { users: Users }

const UsersTable: FC<UsersTableProps> = ({ users }) => {
  const columnHelper = createColumnHelper<User>()
  const columns = [
    columnHelper.accessor("profileImageUrl", {
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
    columnHelper.accessor("username", {
      header: () => "Navn",
    }),
    columnHelper.accessor("emailAddresses", {
      header: () => "Email",
      cell: (info) => {
        return info
          .getValue()
          .map((email) => email.emailAddress)
          .join(",")
      },
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
