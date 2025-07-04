"use client"

import { useUserQuery } from "@/app/user/components/UserSearch/queries"
import { GenericTable } from "@/components/GenericTable"
import { MarkWriteSchema, type PersonalMark } from "@dotkomonline/types"
import { Box, CloseButton, Group, Title } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import type { FC } from "react"
import { useEditMarkMutation } from "../mutations/use-edit-mark-mutation"
import { usePersonalMarkGetByMarkId } from "../queries/use-personal-mark-get-by-mark-id"
import { useMarkWriteForm } from "../write-form"
import { useMarkDetailsContext } from "./provider"

const UserNameCell: FC<{ userId: string }> = ({ userId }) => {
  const { data: user } = useUserQuery(userId)
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
