"use client"

import { DataTable } from "@/components/DataTable"
import type { User } from "@dotkomonline/rpc/user"
import { Avatar, AvatarFallback, AvatarImage } from "@dotkomonline/ui"
import { IconUser } from "@tabler/icons-react"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  users: User[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export function UserTable({
  users,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) {
  const columnHelper = createColumnHelper<User>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((user) => user, {
        id: "name",
        header: () => "Navn",
        cell: (info) => {
          const user = info.getValue()

          return (
            <Link
              href={`/brukere/${user.id}`}
              className="text-sm flex items-center gap-2 px-1 py-1 no-underline transition-colors duration-75 hover:bg-blue-500/10"
            >
              <Avatar className="size-6 rounded-sm">
                {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.name ?? user.username} />}
                <AvatarFallback>
                  <IconUser className="size-4" />
                </AvatarFallback>
              </Avatar>
              {user.name}
            </Link>
          )
        },
      }),
      columnHelper.accessor("email", {
        header: () => "E-post",
        cell: (info) => info.getValue(),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: users,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
