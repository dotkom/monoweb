import { GenericTable } from "@/components/GenericTable"
import { type GroupRole, getGroupRoleTypeName } from "@dotkomonline/types"
import { Icon } from "@iconify/react/dist/iconify.js"
import { Box, Button, Stack, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { type FC, useMemo } from "react"
import { useCreateGroupRoleModal } from "../modals/create-group-role-modal"
import { useEditGroupRoleModal } from "../modals/edit-group-role-modal"
import { useGroupDetailsContext } from "./provider"

export const GroupRolesPage: FC = () => {
  const { group } = useGroupDetailsContext()
  const openCreate = useCreateGroupRoleModal({ group })
  const openUpdate = useEditGroupRoleModal()

  const columnHelper = createColumnHelper<GroupRole>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((role) => role, {
        id: "role",
        header: () => "Navn",
        cell: (info) => info.getValue().name,
      }),
      columnHelper.accessor("type", {
        header: () => "Type",
        cell: (info) => getGroupRoleTypeName(info.getValue()),
      }),
      columnHelper.accessor((role) => role, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Button
            variant="outline"
            leftSection={<Icon icon="tabler:edit" />}
            onClick={() => openUpdate({ role: info.getValue() })}
          >
            Rediger
          </Button>
        ),
      }),
    ],
    [columnHelper, openUpdate]
  )
  const table = useReactTable<GroupRole>({
    data: group.roles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <Box>
      <Stack>
        <Title order={3}>Roller</Title>
        <Box>
          <Button onClick={openCreate}>Opprett rolle</Button>
        </Box>
        <GenericTable table={table} />
      </Stack>
    </Box>
  )
}
