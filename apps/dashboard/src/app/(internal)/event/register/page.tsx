"use client"

import { Stack } from "@mantine/core"
import { useEventWriteForm } from "../components/write-form"
import { useCreateEventMutation } from "../mutations"

export default function Page() {
  const create = useCreateEventMutation()
  const FormComponent = useEventWriteForm({
    onSubmit: (data) => {
      const { hostingGroupIds, ...event } = data
      create.mutate({
        groupIds: hostingGroupIds,
        companies: [],
        event,
        parentId: event.parentId
      })
    },
  })
  return (
    <Stack>
      <FormComponent />
    </Stack>
  )
}
