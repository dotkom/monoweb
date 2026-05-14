"use client"

import { Stack } from "@mantine/core"
import { useContestWriteForm } from "../components/contest-write-form"
import { useCreateContestMutation } from "../mutations"

export default function CreateContestPage() {
  const create = useCreateContestMutation()

  const FormComponent = useContestWriteForm({
    onSubmit: (data) => {
      create.mutate({
        contest: {
          name: data.name,
          description: data.description || null,
          startDate: data.startDate ?? null,
          resultType: data.resultType,
          resultOrder: data.resultOrder,
          groups: data.groups,
        },
      })
    },
  })

  return (
    <Stack>
      <FormComponent />
    </Stack>
  )
}
