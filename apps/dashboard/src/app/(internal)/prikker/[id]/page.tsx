"use client"
import { UserSearch } from "@/app/(internal)/brukere/components/user-search"
import { GenericTable } from "@/components/GenericTable"
import { useTRPC } from "@/lib/trpc-client"
import type { PersonalMarkDetails, User } from "@dotkomonline/types"
import { Box, Button, CloseButton, Group, Stack, Title } from "@mantine/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEditMarkMutation } from "../mutations/use-edit-mark-mutation"
import { useMarkWriteForm } from "../write-form"
import { useMarkDetailsContext } from "./provider"

const columnHelper = createColumnHelper<PersonalMarkDetails>()

export default function MarkEditCard() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { mark } = useMarkDetailsContext()

  const edit = useEditMarkMutation()
  const router = useRouter()

  const markQueryOptions = trpc.personalMark.getPersonalMarkDetailsByMark.queryOptions({
    markId: mark.id,
  })
  const { data: personalMarks } = useQuery({ ...markQueryOptions, initialData: [] })

  const FormComponent = useMarkWriteForm({
    label: "Oppdater prikk",
    onSubmit: (data) => {
      edit.mutate({ changes: { ...data, id: mark.id, type: "MANUAL" }, groupIds: data.groupIds })
    },
    defaultValues: { ...mark, groupIds: mark.groups.map((group) => group.slug) },
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
      cell: (info) => <Link href={`/brukere/${info.getValue().id}`}>{info.getValue().name}</Link>,
    }),
    columnHelper.accessor((personalMark) => formatDate(personalMark.personalMark.createdAt, "dd.MM.yyyy"), {
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
    <Box>
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{mark.title}</Title>
      </Group>
      <Stack>
        <FormComponent />

        <Title order={2}>Gi {mark.weight === 6 ? "suspensjon" : "prikk"} til flere</Title>
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
