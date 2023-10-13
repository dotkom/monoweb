import { Skeleton, Stack, Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { User } from "@dotkomonline/types"
import { useMemo } from "react"
import { formatDate } from "../../../utils/format"
import { useUserAllQuery } from "../../../modules/user/queries/use-user-all-query"
import { GenericTable } from "src/components/GenericTable"

export default function UserPage() {
  const { users, isLoading: isUsersLoading } = useUserAllQuery()

  const columnHelper = createColumnHelper<User>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => "User ID",
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Creation Date",
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("cognitoSub", {
        header: () => "Cognito Sub",
      }),
      columnHelper.accessor((user) => user, {
        id: "details",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor size="sm" href={`/user/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
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
    <Skeleton visible={isUsersLoading}>
      <Stack>
        <GenericTable table={table} />
      </Stack>
    </Skeleton>
  )
}
