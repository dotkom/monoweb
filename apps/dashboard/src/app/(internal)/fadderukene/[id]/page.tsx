"use client"

import type { Fadderuke } from "@dotkomonline/rpc/fadderuke"
import { Button, Group, Skeleton, Stack, Text, Title } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { useFadderukeWriteForm } from "../components/fadderuke-write-form"
import { useDeleteFadderukeMutation, useUpdateFadderukeMutation } from "../mutations"
import { useFadderukeFindManyQuery } from "../queries"

interface EditFadderukeFormProps {
  fadderuke: Fadderuke
}

function EditFadderukeForm({ fadderuke }: EditFadderukeFormProps) {
  const update = useUpdateFadderukeMutation()
  const deleteFadderuke = useDeleteFadderukeMutation()

  const FormComponent = useFadderukeWriteForm({
    label: "Oppdater fadderuke",
    defaultValues: { year: fadderuke.year, eventId: fadderuke.eventId },
    onSubmit: (data) => {
      update.mutate({
        fadderukeId: fadderuke.id,
        fadderuke: {
          year: data.year,
          eventId: data.eventId,
        },
      })
    },
  })

  return (
    <Stack>
      <FormComponent />

      <Group>
        <Button
          color="red"
          variant="light"
          leftSection={<IconTrash width={14} height={14} />}
          onClick={() => deleteFadderuke.mutate({ fadderukeId: fadderuke.id })}
        >
          Slett fadderuke
        </Button>
      </Group>
    </Stack>
  )
}

export default function EditFadderukePage() {
  const params = useParams<{ id: string }>()
  const { fadderuker, isLoading } = useFadderukeFindManyQuery()

  const fadderuke = fadderuker.find((entry) => entry.id === params.id) ?? null

  return (
    <Stack>
      <Title order={1}>Rediger fadderuke</Title>

      <Skeleton visible={isLoading}>
        {fadderuke === null ? <Text>Fant ikke fadderuken.</Text> : <EditFadderukeForm fadderuke={fadderuke} />}
      </Skeleton>
    </Stack>
  )
}
