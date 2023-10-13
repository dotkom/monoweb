"use client"

import { UserWriteSchema } from "@dotkomonline/types"
import { useUserDetailsContext } from "./provider"
import { useUserWriteForm } from "../write-form"
import { useEditUserMutation } from "src/modules/user/mutations/use-edit-user-mutation"
import { Box, CloseButton, Group, Title } from "@mantine/core"
import { useRouter } from "next/navigation"

export default function UserEditCard() {
  const { user } = useUserDetailsContext()
  const edit = useEditUserMutation()
  const router = useRouter()
  const FormComponent = useUserWriteForm({
    label: "Oppdater bruker",
    onSubmit: (data) => {
      const result = UserWriteSchema.parse(data)
      edit.mutate({ id: user.id, data: result })
    },
    defaultValues: { ...user },
  })
  return (
    <Box p="md">
      <Group>
        <CloseButton onClick={() => router.back()} />
        <Title>{user.id}</Title>
      </Group>

      <FormComponent />
    </Box>
  )
}
