"use client"
import { UserSearch } from "@/app/user/components/UserSearch/UserSearch"
import { GenericTable } from "@/components/GenericTable"
import { useTRPC } from "@/lib/trpc"
import type { DashboardPersonalMark, User } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import { Box, Button, CloseButton, Group, Stack, Title } from "@mantine/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEditMarkMutation } from "../mutations/use-edit-mark-mutation"
import { useMarkWriteForm } from "../write-form"
import { useMarkDetailsContext } from "./provider"

const columnHelper = createColumnHelper<DashboardPersonalMark>()

export default function MarkEditCard() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mark } = useMarkDetailsContext()

  const edit = useEditMarkMutation()
  const router = useRouter()

  const markQueryOptions = trpc.personalMark.getDashboardPersonalMarksByMark.queryOptions({
    id: mark.id,
  })
  const { data: personalMarks } = useQuery({ ...markQueryOptions, initialData: [] })

  const FormComponent = useMarkWriteForm({
    label: "Oppdater prikk",
    onSubmit: (data) => {
      edit.mutate({ ...data, id: mark.id, type: "MANUAL" })
    },
    defaultValues: { ...mark },
  })

  const removeMark = useMutation(
    trpc.personalMark.removeFromUser.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(markQueryOptions),
    })
  )

  const giveMark = useMutation(
    trpc.personalMark.addToUser.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(markQueryOptions),
    })
  )

  const columns = [
    columnHelper.accessor((personalMark) => personalMark.user, {
      id: "userName",
      header: () => "Bruker",
      cell: (info) => <Link href={`/user/${info.getValue().id}`}>{info.getValue().name}</Link>,
    }),
    columnHelper.accessor((personalMark) => formatDate(personalMark.personalMark.createdAt), {
      id: "createdAt",
      header: () => "Gitt",
    }),
    columnHelper.accessor((personalMark) => personalMark, {
      id: "remove",
      header: () => "Fjern prikk",
      cell: (info) => (
        <Button
          onClick={() => {
            const {
              user: { id: userId },
              personalMark: { markId },
            } = info.getValue()
            removeMark.mutate({ userId, markId })
          }}
        >
          Fjern
        </Button>
      ),
    }),
  ]

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
      <Stack>
        <FormComponent />

        <Title order={2}>Gi {mark.weight === 6 ? 'suspensjon' : 'prikk'} til flere</Title>
        <UserSearch
          excludeUserIds={personalMarks.map((mark) => mark.user.id)}
          onSubmit={(data: User) => {
            giveMark.mutate({
              userId: data.id,
              markId: mark.id,
            })
          }}
        />
        <GenericTable table={table} />
      </Stack>
    </Box>
  )
}
