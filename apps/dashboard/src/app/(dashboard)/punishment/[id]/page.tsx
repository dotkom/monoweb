"use client"

import type { FC } from "react"
import { MarkWriteSchema, PersonalMark } from "@dotkomonline/types"
import { useMarkDetailsContext } from "./provider"
import { useMarkWriteForm } from "../write-form"
import { Box, CloseButton, Group, Title } from "@mantine/core"
import { useRouter } from "next/navigation"
import { useEditMarkMutation } from "src/modules/punishment/mutations/use-edit-mark-mutation"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useUserGetQuery } from "src/modules/user/queries/use-user-get-query"
import { GenericTable } from "src/components/GenericTable"
import { usePersonalMarkGetByMarkId } from "src/modules/punishment/queries/use-personal-mark-get-by-mark-id"

const UserNameCell: FC<{ userId: string }> = ({ userId }) => {
  const { user } = useUserGetQuery(userId)
  return <span>{user?.id || "Loading..."}</span>
}

const columnHelper = createColumnHelper<PersonalMark>()
const columns = [
  columnHelper.accessor((personalMark) => personalMark, {
    id: "userName",
    header: () => "Bruker",
    cell: (info) => <UserNameCell userId={info.getValue().userId} />,
  }),
]

export default function MarkEditCard() {
  const { mark } = useMarkDetailsContext()
  const edit = useEditMarkMutation()
  const router = useRouter()
  const { personalMarks } = usePersonalMarkGetByMarkId(mark.id)
  const FormComponent = useMarkWriteForm({
    label: "Oppdater prikk",
    onSubmit: (data) => {
      MarkWriteSchema.parse(data)
      edit.mutate({ id: mark.id, ...data })
    },
    defaultValues: { ...mark },
  })

  const table = useReactTable({
    data: personalMarks,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{mark.title}</Title>
      </Group>
      <FormComponent />
      <GenericTable table={table} />
    </Box>
  )
}
