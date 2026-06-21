"use client"

import { Stack, Title } from "@mantine/core"
import { useFadderukeWriteForm } from "../components/fadderuke-write-form"
import { useCreateFadderukeMutation } from "../mutations"

export default function CreateFadderukePage() {
  const create = useCreateFadderukeMutation()

  const FormComponent = useFadderukeWriteForm({
    onSubmit: (data) => {
      create.mutate({
        fadderuke: {
          year: data.year,
          eventId: data.eventId,
        },
      })
    },
  })

  return (
    <Stack>
      <Title order={1}>Opprett fadderuke</Title>
      <FormComponent />
    </Stack>
  )
}
